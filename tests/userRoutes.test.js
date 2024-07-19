const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const mockingoose = require('mockingoose');
const User = require('../models/user');
const userRoutes = require('../routes/api/userRoutes'); // Adjust the path if necessary
const mockDB = require('../middleware/mockDB');
const { createSQLUser } = require('../models/usersql');
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
    createSQLUser: jest.fn()
}));

describe('User Controller Tests', () => {
    beforeEach(async () => {
        await User.deleteMany({});
        mockingoose.resetAll();
    });

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

    describe('POST /users', () => {
        it.only('should create a new user', async () => {
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

            // Mock SQL user creation to resolve successfully
            createSQLUser.mockResolvedValue({ userId: 'mockUserId', username: 'TestUserWithSQL' });

            // Mock MongoDB user creation
            mockingoose(User).toReturn({
                _id: '60c72b2f9b1d8b3a3c8d1e35',
                ...newUser,
                dateCreated: '2024-07-20T00:00:00.000Z'
            }, 'save');

            const res = await request(app).post('/users').send(newUser);
            console.log('Response status:', res.status);
            console.log('Response body:', res.body);
            expect(res.status).toBe(201);
            expect(res.body.message).toBe(`User ${newUser.username} created successfully in MongoDB and SQL BY Admin mockUserId`);
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

    // Add more tests for updateUser, editUser, deleteUser, getUser as needed
});
