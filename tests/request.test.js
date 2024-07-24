const Request = require("../models/request"); // Adjust the path to your Pantry model
const sql = require("mssql");
const axios = require("axios");
const { dbConfig } = require('../config/dbConfig');

// Mock SQL module and connection
jest.mock('mssql', () => ({
    connect: jest.fn(),
    close: jest.fn(),
    request: jest.fn()
  }));
  // Add type definitions
  sql.VarChar = jest.fn(() => 'VarChar');
  sql.Int = jest.fn(() => 'Int');

  // Mock generateUUID24 directly within the test file
const generateUUID24 = jest.fn();

describe('Request Class Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('getRequestByUserId', () => {
      it('should retrieve requests by user ID successfully', async () => {
        const userId = 'user123';
        const mockResult = {
          recordset: [
            {
              request_id: 'req1',
              title: 'Test Request',
              category: 'Test Category',
              description: 'Test Description',
              user_id: userId,
              volunteer_id: null,
              isCompleted: 0,
              admin_id: null
            }
          ]
        };
  
        // Mock SQL connection and query result
        sql.connect.mockResolvedValue({
          request: jest.fn().mockImplementation(() => ({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue(mockResult)
          })),
          close: jest.fn().mockResolvedValue(undefined)
        });
  
        // Call the method
        const result = await Request.getRequestByUserId(userId);
        
        // Assert the result
        expect(result).toEqual(mockResult.recordset);
      });
  
      it('should handle error while retrieving requests by user ID', async () => {
        const userId = 'user123';
        const errorMessage = 'Database connection error';
  
        // Mock SQL connection to throw an error
        sql.connect.mockRejectedValue(new Error(errorMessage));
  
        // Call the method and assert that it throws an error
        await expect(Request.getRequestByUserId(userId)).rejects.toThrow(errorMessage);
      });
    });
    describe('createRequest', () => {
        it('should create a request successfully', async () => {
          const requestData = {
            title: 'Test Request',
            category: 'Test Category',
            description: 'Test Description',
            user_id: 'user123'
          };
    
          const mockResult = {
            request_id: 'mock-uuid',
            title: 'Test Request',
            category: 'Test Category',
            description: 'Test Description',
            user_id: 'user123',
            volunteer_id: null,
            isCompleted: 0,
            admin_id: null
          };
    
          // Mock SQL connection and query result
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockResolvedValue(undefined) // Simulate successful insert
            })),
            close: jest.fn().mockResolvedValue(undefined),
            connect: jest.fn().mockResolvedValue(undefined) // Mock the connect method
          });
    
          // Mock the getRequestById method to return the mock result
          Request.getRequestById = jest.fn().mockResolvedValue(mockResult);
    
          // Call the method
          const result = await Request.createRequest(requestData);
    
          // Assert the result
          expect(result).toEqual(mockResult);
        });
    
        it('should handle error while creating a request', async () => {
          const requestData = {
            title: 'Test Request',
            category: 'Test Category',
            description: 'Test Description',
            user_id: 'user123'
          };
          const errorMessage = 'Database error';
    
          // Mock SQL connection to throw an error
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockRejectedValue(new Error(errorMessage)) // Simulate failure
            })),
            close: jest.fn().mockResolvedValue(undefined),
            connect: jest.fn().mockResolvedValue(undefined) // Mock the connect method
          });
    
          // Call the method and assert that it throws an error
          await expect(Request.createRequest(requestData)).rejects.toThrow(errorMessage);
        });
      });
      describe('getAvailableRequests', () => {
        it('should retrieve available requests successfully', async () => {
          const mockResult = {
            recordset: [
              {
                request_id: 'req1',
                title: 'Test Request 1',
                category: 'Test Category 1',
                description: 'Test Description 1',
                user_id: 'user123',
                volunteer_id: null,
                isCompleted: 0,
                admin_id: null
              },
              {
                request_id: 'req2',
                title: 'Test Request 2',
                category: 'Test Category 2',
                description: 'Test Description 2',
                user_id: 'user456',
                volunteer_id: null,
                isCompleted: 0,
                admin_id: null
              }
            ]
          };
    
          // Mock SQL connection and query result
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              query: jest.fn().mockResolvedValue(mockResult)
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method
          const result = await Request.getAvailableRequests();
    
          // Assert the result
          expect(result).toEqual(mockResult.recordset.map(record => new Request(
            record.request_id,
            record.title,
            record.category,
            record.description,
            record.user_id,
            record.volunteer_id,
            record.isCompleted,
            record.admin_id
          )));
        });
    
        it('should return an empty array when no available requests', async () => {
          const mockResult = {
            recordset: []
          };
    
          // Mock SQL connection and query result
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              query: jest.fn().mockResolvedValue(mockResult)
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method
          const result = await Request.getAvailableRequests();
    
          // Assert the result
          expect(result).toEqual([]);
        });
    
        it('should handle error while retrieving available requests', async () => {
          const errorMessage = 'Database error';
    
          // Mock SQL connection to throw an error
          sql.connect.mockRejectedValue(new Error(errorMessage));
    
          // Call the method and assert that it throws an error
          await expect(Request.getAvailableRequests()).rejects.toThrow(errorMessage);
        });
      });
      describe('updateAcceptedRequest', () => {
        it('should update the request successfully', async () => {
          const requestId = 'req1';
          const newVolunteerId = 'volunteer123';
    
          const mockUpdateResult = {
            recordset: [
              {
                request_id: requestId,
                title: 'Test Request',
                category: 'Test Category',
                description: 'Test Description',
                user_id: 'user123',
                volunteer_id: newVolunteerId,
                isCompleted: 0,
                admin_id: null
              }
            ]
          };
    
          // Mock the SQL connection and query results
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockResolvedValue(undefined) // Simulate successful update
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Mock the getRequestById method to return the updated result
          Request.getRequestById = jest.fn().mockResolvedValue(mockUpdateResult.recordset[0]);
    
          // Call the method
          const result = await Request.updateAcceptedRequest(requestId, newVolunteerId);
    
          // Assert the result
          expect(result).toEqual(mockUpdateResult.recordset[0]);
        });
    
        it('should handle error while updating request', async () => {
          const requestId = 'req1';
          const newVolunteerId = 'volunteer123';
          const errorMessage = 'Database error';
    
          // Mock SQL connection to throw an error
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockRejectedValue(new Error(errorMessage)) // Simulate failure
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method and assert that it throws an error
          await expect(Request.updateAcceptedRequest(requestId, newVolunteerId)).rejects.toThrow(errorMessage);
        });
      });
      describe('getAcceptedRequestById', () => {
        it('should retrieve requests by volunteer ID successfully', async () => {
          const volunteerId = 'volunteer123';
    
          const mockResult = {
            recordset: [
              {
                request_id: 'req1',
                title: 'Test Request 1',
                category: 'Test Category 1',
                description: 'Test Description 1',
                user_id: 'user123',
                volunteer_id: volunteerId,
                isCompleted: 0,
                admin_id: null
              },
              {
                request_id: 'req2',
                title: 'Test Request 2',
                category: 'Test Category 2',
                description: 'Test Description 2',
                user_id: 'user456',
                volunteer_id: volunteerId,
                isCompleted: 0,
                admin_id: null
              }
            ]
          };
    
          // Mock SQL connection and query results
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockResolvedValue(mockResult)
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method
          const result = await Request.getAcceptedRequestById(volunteerId);
    
          // Assert the result
          expect(result).toEqual(mockResult.recordset.map(record => new Request(
            record.request_id,
            record.title,
            record.category,
            record.description,
            record.user_id,
            record.volunteer_id,
            record.isCompleted,
            record.admin_id
          )));
        });
    
        it('should return null when no requests are found for the volunteer ID', async () => {
          const volunteerId = 'volunteer123';
    
          // Mock SQL connection and query results
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockResolvedValue({ recordset: [] })
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method
          const result = await Request.getAcceptedRequestById(volunteerId);
    
          // Assert the result
          expect(result).toBeNull();
        });
    
        it('should handle errors while retrieving requests by volunteer ID', async () => {
          const volunteerId = 'volunteer123';
          const errorMessage = 'Database error';
    
          // Mock SQL connection to throw an error
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockRejectedValue(new Error(errorMessage))
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method and assert that it throws an error
          await expect(Request.getAcceptedRequestById(volunteerId)).rejects.toThrow(errorMessage);
        });
      });
      describe('createIngredientList', () => {
        it.only('should insert a new ingredient list entry successfully when it does not already exist', async () => {
            const request_id = 'request123';
            const pantry_id = 'pantry123';
            const ingredient_id = 1;
            const mockReqingId = jest.spyOn(Request, 'generateUUID24');

            const checkResult = {
                recordset: [{ count: 0 }] // Simulate that the entry does not exist
            };

            // Mock SQL connection and query results
            sql.connect.mockResolvedValue({
                request: jest.fn().mockImplementation(() => ({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn()
                        .mockResolvedValueOnce(checkResult) // Check query
                        .mockResolvedValueOnce({}) // Insert query
                })),
                close: jest.fn().mockResolvedValue(undefined)
            });

            // Call the method
            const result = await Request.createIngredientList(request_id, pantry_id, ingredient_id);

            // Assert the result
            expect(result).toEqual({ reqing_id: mockReqingId, request_id, pantry_id, ingredient_id, count: 1 });
        });
    
        it('should not insert an entry if it already exists', async () => {
          const request_id = 'request123';
          const pantry_id = 'pantry123';
          const ingredient_id = 1;
    
          const checkResult = {
            recordset: [{ count: 1 }] // Simulate that the entry already exists
          };
    
          // Mock SQL connection and query results
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockResolvedValue(checkResult)
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method
          const result = await Request.createIngredientList(request_id, pantry_id, ingredient_id);
    
          // Assert that no new entry was inserted and no result is returned
          expect(result).toBeUndefined(); // or handle as per your actual implementation
        });
    
        it('should handle errors while creating an ingredient list entry', async () => {
          const request_id = 'request123';
          const pantry_id = 'pantry123';
          const ingredient_id = 1;
          const errorMessage = 'Database error';
    
          // Mock SQL connection to throw an error
          sql.connect.mockResolvedValue({
            request: jest.fn().mockImplementation(() => ({
              input: jest.fn().mockReturnThis(),
              query: jest.fn().mockRejectedValue(new Error(errorMessage))
            })),
            close: jest.fn().mockResolvedValue(undefined)
          });
    
          // Call the method and assert that it throws an error
          await expect(Request.createIngredientList(request_id, pantry_id, ingredient_id)).rejects.toThrow(errorMessage);
        });
      });
  });