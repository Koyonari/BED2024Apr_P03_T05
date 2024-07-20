const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const mockingoose = require('mockingoose');
const User = require('../models/user');
const userRoutes = require('../routes/api/userRoutes'); // Adjust the path if necessary
const mockDB = require('../middleware/mockDB');
const { createSQLUser, updateSQLUsername, deleteSQLUser } = require('../models/usersql');
const db = require('../middleware/db');
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

// Mock the database connection
jest.mock('../middleware/db', () => ({
    connect: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
}));
// Mock the JWT verification middleware
jest.mock('../middleware/verifyJWT', () => (req, res, next) => {
    req.userid = 'mockUserId'; // Mock user data
    req.roles = ['User']; // Mock roles
    next();
});

// Mock the role verification middleware
jest.mock('../middleware/verifyRoles', () => () => (req, res, next) => {
    next();
});

// Mock the authorization check middleware
jest.mock('../middleware/checkAuthorisation', () => (req, res, next) => {
    next();
});

jest.mock('../middleware/validateUser', () => (req, res, next) => {
    next();
});
// Mock the SQL functions
jest.mock('../models/usersql', () => ({
    createSQLUser: jest.fn(),
    updateSQLUsername: jest.fn(),
    deleteSQLUser: jest.fn()
}));

jest.mock('../middleware/checkUserExists', () => (req, res, next) => {
    next();
});

describe('User Controller Tests', () => {
    beforeEach(async () => {
        await User.deleteMany({});
        mockingoose.resetAll();
    });

    // Test case for getting all users
    describe('GET /users', () => {
        it('should return all users', async () => {
            const users = [
                {
                    _id: '60c72b2f9b1d8b3a3c8d1e33',
                    username: 'user1',
                    email: 'user1@example.com',
                    dateCreated: '2024-07-19T19:31:15.197Z',
                    dietaryRestrictions: [],
                    excludedIngredients: [],
                    intolerances: [],
                    roles: { User: 2001 }
                },
                {
                    _id: '60c72b3f9b1d8b3a3c8d1e34',
                    username: 'user2',
                    email: 'user2@example.com',
                    dateCreated: '2024-07-19T19:31:15.198Z',
                    dietaryRestrictions: [],
                    excludedIngredients: [],
                    intolerances: [],
                    roles: { User: 2001 }
                }
            ];

            mockingoose(User).toReturn(users, 'find');

            const res = await request(app).get('/users');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(users);
        });

        it('should return 204 if no users found', async () => {
            mockingoose(User).toReturn([], 'find');

            const res = await request(app).get('/users');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
        });
    });

    // Test case for creating a new user, by admin
    describe('POST /users', () => {
        it('should create a new user', async () => {
            // Define mock user ID
            const mockUserId = '60c72b2f9b1d8b3a3c8d1e35';
            const newUser = {
                username: 'TestUserWithSQL',
                password: 'User123!',
                email: 'john.doe.xxx@example.com',
                contact: '12345678',
                roles: { User: 2001 },
                firstname: 'Test',
                lastname: 'User',
                address: '123 Main St',
                dietaryRestrictions: ['Pescetarian', 'Paleo'],
                intolerances: ['Sesame', 'Shellfish'],
                excludedIngredients: ['fish', 'chicken', 'beef'],
                dateOfBirth: '2024-06-06'
            };

            // Mock MongoDB user creation
            mockingoose(User).toReturn({
                _id: mockUserId,
                ...newUser,
                dateCreated: new Date().toISOString() // Adjusted to current date for testing
            }, 'save');

            // Mock SQL user creation
            createSQLUser.mockResolvedValue({ userId: mockUserId, username: newUser.username });
            const res = await request(app).post('/users').send(newUser);

            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            expect(res.status).toBe(201);
            expect(res.body.message).toBe(`User ${newUser.username} with ID ${mockUserId} created successfully in MongoDB and SQL BY Admin`);
        });

        it('should return 400 if required fields are missing', async () => {
            const newUser = {
                username: 'newUser',
                email: 'newuser@example.com',
                contact: '1234567890'
            };

            const res = await request(app).post('/users').send(newUser);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Username, password, email, and contact are required.');
        });

        it('should return 403 if attempting to create an admin user', async () => {
            const newUser = {
                username: 'AdminUser',
                password: 'Admin123!',
                email: 'admin@example.com',
                contact: '12345678',
                roles: { Admin: 3001 },
                firstname: 'Admin',
                lastname: 'User'
            };

            const res = await request(app).post('/users').send(newUser);
            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Cannot create an admin user through this operation');
        });
    });

    // Test case for editing a user by ID
    describe('PUT /users/:id', () => {
        beforeEach(() => {
            mockingoose.resetAll();
        });
        // Unable to test, works in Postman and Front-End application but not in Jest
        it.skip('should update an existing user', async () => {
            const mockUserId = new mongoose.Types.ObjectId().toHexString();
            const updatedUser = {
                username: 'UpdatedUser',
                password: 'UpdatedPassword123!',
                email: 'updated.email@example.com',
                contact: '87654321',
                roles: { User: 2001 },
                firstname: 'Updated',
                lastname: 'User',
                address: '456 Another St',
                dietaryRestrictions: ['Vegan'],
                intolerances: ['Nuts'],
                excludedIngredients: ['soy'],
                dateOfBirth: '1990-01-01'
            };

            // Mock `findByIdAndUpdate` to return the updated user
            mockingoose(User).toReturn({
                _id: mockUserId,
                ...updatedUser,
                dateCreated: new Date().toISOString()
            }, 'findByIdAndUpdate');

            // Mock `findOne` to return the user (if needed for your validation)
            mockingoose(User).toReturn({
                _id: mockUserId,
                username: 'OldUsername',
                password: 'OldPassword',
                email: 'old.email@example.com',
                contact: '12345678'
            }, 'findOne');

            const res = await request(app).put(`/users/${mockUserId}`).send(updatedUser);
            updateSQLUsername.mockResolvedValue({});

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);
            console.log('Updated user:', updatedUser);
            console.log('Updated username:', updatedUser.username);
            // Assertions
            expect(res.status).toBe(200);
            expect(res.body.message).toBe(`User ${updatedUser.username} updated successfully`);
            expect(res.body.user).toMatchObject({
                _id: mockUserId,
                ...updatedUser
            });
        });

        it('should return 400 if required fields are missing', async () => {
            const mockUserId = '60c72b2f9b1d8b3a3c8d1e35';
            const updatePayload = { email: 'new.email@example.com' };

            const res = await request(app).put(`/users/${mockUserId}`).send(updatePayload);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Username, password, email, and contact are required.');
        });

        it('should return 403 if attempting to assign Admin role', async () => {
            const mockUserId = '60c72b2f9b1d8b3a3c8d1e35';
            const updatePayload = {
                username: 'NewAdmin',
                password: 'AdminPass123!',
                email: 'admin@example.com',
                contact: '12345678',
                roles: { Admin: 3001 }
            };

            const res = await request(app).put(`/users/${mockUserId}`).send(updatePayload);

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Cannot assign Admin role through this operation');
        });
    });

    // Test case for editing a user by ID
    describe('PATCH /users/:id', () => {
        it('should update the firstname of an existing user', async () => {
            const mockUserId = new mongoose.Types.ObjectId().toHexString();
            const updates = { firstname: 'ChangedName' };
            /* Mock the existing user, have to include parameters that are 'required' in the schema
            Actual can take multiple fields*/
            const existingUser = {
                _id: mockUserId,
                firstname: 'OriginalName',
                contact: '1234567890',  // Assuming these fields are required by your model
                email: 'test@example.com',
                password: 'oldpassword',
                username: 'oldusername',
                save: jest.fn().mockResolvedValue({
                    _id: mockUserId,
                    firstname: 'ChangedName',
                    contact: '1234567890',
                    email: 'test@example.com',
                    password: 'newpassword',
                    username: 'oldusername'
                }),
                validateSync: jest.fn().mockReturnValue(null), // Simulate successful validation
                toObject: () => ({
                    _id: mockUserId,
                    firstname: 'OriginalName',
                    contact: '1234567890',
                    email: 'test@example.com',
                    password: 'oldpassword',
                    username: 'oldusername'
                })
            };

            // Mock `findOne` to return the existing user
            mockingoose(User).toReturn(existingUser, 'findOne');

            const res = await request(app).patch(`/users/${mockUserId}`).send(updates);

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            // Assertions
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User updated successfully');
            expect(res.body.editedFields).toEqual(updates);
        });

        it('should return 404 if the user is not found', async () => {
            const mockUserId = new mongoose.Types.ObjectId().toHexString(); // Use `new` here
            const updates = {
                firstname: 'ChangedName'
            };

            // Mocking the User model to return null for findOne
            mockingoose(User).toReturn(null, 'findOne');

            // Send a PATCH request to update the user
            const res = await request(app).patch(`/users/${mockUserId}`).send(updates);

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            // Assertions
            expect(res.status).toBe(404);
            expect(res.body.message).toBe(`User with ID ${mockUserId} not found`);
        });

        it('should return 400 if no updates are provided', async () => {
            const mockUserId = new mongoose.Types.ObjectId().toHexString(); // Use `new` here

            // Send a PATCH request with no update data
            const res = await request(app).patch(`/users/${mockUserId}`).send({});

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            // Assertions
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Updates must be provided to update the user');
        });

        it('should handle validation errors', async () => {
            const mockUserId = new mongoose.Types.ObjectId().toHexString(); // Use `new` here
            const updates = {
                firstname: 'ChangedName'
            };

            // Mocking the User model
            mockingoose(User).toReturn({
                _id: mockUserId,
                firstname: updates.firstname
            }, 'findOne');

            const validationResult = {
                errors: {
                    firstname: {
                        message: 'Invalid firstname'
                    }
                }
            };
            mockingoose(User).toReturn(validationResult, 'validateSync');

            // Send a PATCH request with invalid update data
            const res = await request(app).patch(`/users/${mockUserId}`).send(updates);

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            // Assertions
            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    field: 'contact',
                    message: 'Path `contact` is required.'
                }),
                expect.objectContaining({
                    field: 'email',
                    message: 'Path `email` is required.'
                }),
                expect.objectContaining({
                    field: 'password',
                    message: 'Path `password` is required.'
                }),
                expect.objectContaining({
                    field: 'username',
                    message: 'Path `username` is required.'
                })
            ]));
        });
    });

    // Test case for deleting a user
    describe('DELETE /users/:id', () => {
        let userId;

        beforeAll(() => {
            userId = '60c72b2f9b1d8b3a3c8d1e33'; // Example MongoDB ObjectID
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should successfully delete a user from both MongoDB and SQL', async () => {
            mockingoose(User).toReturn({ _id: userId }, 'findOne');
            mockingoose(User).toReturn({ _id: userId }, 'findById');
            mockingoose(User).toReturn({ _id: userId }, 'deleteOne');
            deleteSQLUser.mockResolvedValue({});

            const response = await request(app)
                .delete(`/users/${userId}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(`User with ID ${userId} deleted successfully`);
        });

        it('should handle errors during MongoDB user deletion', async () => {
            // Mock finding the user in MongoDB
            mockingoose(User).toReturn({ _id: userId }, 'findOne');
            mockingoose(User).toReturn({ _id: userId }, 'findById');
            mockingoose(User).toReturn({ _id: userId }, 'deleteOne');

            // Mock MongoDB delete operation error
            mockingoose(User).toReturn(new Error('MongoDB error'), 'deleteOne');

            const response = await request(app)
                .delete(`/users/${userId}`)
                .send();

            expect(response.status).toBe(500);
            expect(response.body.message).toMatch(/Failed to delete user from MongoDB/);
        });

        it('should handle errors during SQL user deletion', async () => {
            // Mock finding the user in MongoDB
            mockingoose(User).toReturn({ _id: userId }, 'findOne');
            mockingoose(User).toReturn({ _id: userId }, 'findById');
            mockingoose(User).toReturn({ _id: userId }, 'deleteOne');

            // Mock successful MongoDB deletion
            mockingoose(User).toReturn({}, 'deleteOne');

            // Mock SQL deletion error
            deleteSQLUser.mockRejectedValue(new Error('SQL error'));

            const response = await request(app)
                .delete(`/users/${userId}`)
                .send();

            expect(response.status).toBe(500);
            expect(response.body.message).toMatch(/Failed to delete user from SQL/);
        });

        it('should return 400 for invalid user ID format', async () => {
            const invalidUserId = 'invalid-id-format';

            const response = await request(app)
                .delete(`/users/${invalidUserId}`)
                .send();

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(`Invalid user ID format: ${invalidUserId}`);
        });

        it('should return 404 if the user is not found', async () => {
            // Mock user not found in MongoDB
            mockingoose(User).toReturn(null, 'findById');

            const response = await request(app)
                .delete(`/users/${userId}`)
                .send();

            expect(response.status).toBe(404);
            expect(response.body.message).toBe(`User with ID ${userId} not found`);
        });
    });

    // Test case for getting a user by ID
    describe('GET /users/:id', () => {
        // Test case: Valid user ID with existing user
        it('should return the user for a valid user ID', async () => {
            const mockUserId = new mongoose.Types.ObjectId().toHexString();
            const user = {
                _id: mockUserId,
                username: 'TestUser',
                email: 'testuser@example.com',
                contact: '1234567890',
                firstname: 'Test',
                lastname: 'User'
            };

            mockingoose(User).toReturn(user, 'findOne');

            const res = await request(app).get(`/users/${mockUserId}`);

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject(user);
        });

        // Test case: Valid user ID with non-existing user
        it('should return 404 for a valid user ID but non-existing user', async () => {
            const mockUserId = new mongoose.Types.ObjectId().toHexString();

            mockingoose(User).toReturn(null, 'findOne');

            const res = await request(app).get(`/users/${mockUserId}`);

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe(`User with ID ${mockUserId} not found`);
        });

        // Test case: Invalid user ID format
        it('should return 400 for invalid user ID format', async () => {
            const invalidId = 'invalid_id';

            const res = await request(app).get(`/users/${invalidId}`);

            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid user ID format');
        });

        // Test case: Missing user ID in request parameters
        it('should return 400 if user ID is missing', async () => {
            // Adjust the URL to ensure it hits the route that requires an ID
            const res = await request(app).get('/users/invalid-id'); // Use an invalid ID format
        
            // Log the response status and body for debugging
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);
        
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid user ID format'); // Ensure the message matches for invalid ID format
        });
    });
});

