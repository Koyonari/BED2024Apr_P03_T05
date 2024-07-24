const Request = require("../models/request"); // Adjust the path to your Pantry model
const sql = require("mssql");
const axios = require("axios");
const { dbConfig } = require('../config/dbConfig');

// Mock SQL module and connection
jest.mock('mssql', () => ({
  connect: jest.fn()
}));
// Add type definitions
sql.VarChar = jest.fn(() => 'VarChar');
sql.Int = jest.fn(() => 'Int');

// Mock generateUUID24 directly within the test file
const generateUUID24 = jest.fn();

describe('Request Class Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterEach(() => {
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
    it('should insert a new ingredient list entry successfully when it does not already exist', async () => {
      const request_id = 'request123';
      const pantry_id = 'pantry123';
      const ingredient_id = 1;

      const checkResult = {
        recordset: [{ count: 0 }] // Simulate that the entry does not exist
      };

      const insertResult = {}; // Simulate successful insert query

      // Mock SQL connection and query results
      mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn()
            .mockResolvedValueOnce(checkResult) // Check query
            .mockResolvedValueOnce(insertResult) // Insert query
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method
      const result = await Request.createIngredientList(request_id, pantry_id, ingredient_id);

      // Assert the result
      expect(result).toEqual({ request_id, pantry_id, ingredient_id, count: 1 });
    });

    it('should not insert an entry if it already exists', async () => {
      const request_id = 'request123';
      const pantry_id = 'pantry123';
      const ingredient_id = 1;

      const checkResult = {
        recordset: [{ count: 1 }] // Simulate that the entry already exists
      };

      // Mock SQL connection and query results
      mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn()
            .mockResolvedValueOnce(checkResult) // Check query
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method
      const result = await Request.createIngredientList(request_id, pantry_id, ingredient_id);

      // Assert that no new entry was inserted
      expect(result).toBeUndefined(); // No result should be returned
    });
  });
});
describe('getRequestIngredientById', () => {
  it('should retrieve request ingredient details successfully', async () => {
    const requestId = 'request123';
    const mockResult = {
      recordset: [
        {
          user_name: 'John Doe',
          user_id: 'user123',
          volunteer_name: 'Jane Smith',
          volunteer_id: 'volunteer123',
          request_title: 'Sample Request',
          request_category: 'Category A',
          request_description: 'Description of the request',
          ingredient_name: 'Tomato',
          ingredient_quantity: 10
        }
      ]
    };

    // Mock SQL connection and query results
    mockConnection = {
      request: jest.fn().mockImplementation(() => ({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue(mockResult)
      })),
      close: jest.fn().mockResolvedValue(undefined)
    };

    sql.connect = jest.fn().mockResolvedValue(mockConnection);

    // Call the method
    const result = await Request.getRequestIngredientById(requestId);

    // Assert the result
    expect(result).toEqual(mockResult.recordset);
  });

  it('should handle errors and throw them properly', async () => {
    const requestId = 'request123';
    const mockError = new Error('Database error');

    // Mock SQL connection and query results
    mockConnection = {
      request: jest.fn().mockImplementation(() => ({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(mockError)
      })),
      close: jest.fn().mockResolvedValue(undefined)
    };

    sql.connect = jest.fn().mockResolvedValue(mockConnection);

    // Call the method and assert error handling
    await expect(Request.getRequestIngredientById(requestId)).rejects.toThrow('Database error');
  });

  describe('updateCompletedRequest', () => {
    it('should update the request status successfully and return the updated request', async () => {
      const requestId = 'request123';
      const mockUpdatedRequest = {
        request_id: 'request123',
        title: 'Sample Request',
        category: 'Category A',
        description: 'Description of the request',
        user_id: 'user123',
        volunteer_id: null,
        isCompleted: 1,
        admin_id: null
      };

      // Mock getRequestById to return the updated request
      jest.spyOn(Request, 'getRequestById').mockResolvedValue(mockUpdatedRequest);

      // Mock SQL connection and query results
      const mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({})
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method
      const result = await Request.updateCompletedRequest(requestId);

      // Assert the result
      expect(result).toEqual(mockUpdatedRequest);
    });

    it('should handle errors and throw them properly', async () => {
      const requestId = 'request123';
      const mockError = new Error('Database error');

      // Mock SQL connection and query results
      mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockRejectedValue(mockError)
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method and assert error handling
      await expect(Request.updateCompletedRequest(requestId)).rejects.toThrow('Database error');
    });
  });

  describe('getRequestById', () => {
    it('should retrieve a request by its ID successfully', async () => {
      const requestId = 'request123';
      const mockRequest = {
        request_id: 'request123',
        title: 'Sample Request',
        category: 'Category A',
        description: 'Description of the request',
        user_id: 'user123',
        volunteer_id: null,
        isCompleted: 1,
        admin_id: null
      };

      // Mock SQL connection and query results
      mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({
            recordset: [mockRequest]
          })
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method
      const result = await Request.getRequestById(requestId);

      // Assert the result
      expect(result).toEqual(mockRequest);
    });

    // Test case only works when isolated
    it.skip('should handle errors and throw them properly', async () => {
       const requestId = 'request123';
        const mockError = new Error('Database error');
        sql.connect.mockRejectedValue(mockError);

        await expect(Request.getRequestById(requestId)).rejects.toThrow('Database error');
    });
  });

  describe('getUserDetailsById', () => {
    it('should retrieve user details by user ID successfully', async () => {
      const userId = 'user123';
      const mockResult = {
        recordset: [
          {
            user_id: userId,
            name: 'John Doe',
            email: 'john@example.com'
          }
        ]
      };

      // Mock SQL connection and query results
      const mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue(mockResult) // Simulate successful query
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method
      const result = await Request.getUserDetailsById(userId);

      // Assert the result
      expect(result).toEqual(mockResult.recordset[0]);
    });

    it('should return null when no user is found', async () => {
      const userId = 'user123';
      const mockResult = {
        recordset: [] // Simulate no results
      };

      // Mock SQL connection and query results
      const mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue(mockResult) // Simulate successful query
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method
      const result = await Request.getUserDetailsById(userId);

      // Assert the result
      expect(result).toBeNull();
    });

    it('should handle errors and throw them properly', async () => {
      const userId = 'user123';
      const mockError = new Error('Database error');

      // Mock SQL connection to throw an error
      const mockConnection = {
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockRejectedValue(mockError) // Simulate query failure
        })),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect = jest.fn().mockResolvedValue(mockConnection);

      // Call the method and assert error handling
      await expect(Request.getUserDetailsById(userId)).rejects.toThrow('Database error');
    });
  });
  describe('updateApproveRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('should update the request and return the updated request', async () => {
      const requestId = 'request123';
      const adminId = 'admin456';
      const mockUpdatedRequest = {
        request_id: requestId,
        title: 'Sample Request',
        category: 'Category A',
        description: 'Description of the request',
        user_id: 'user123',
        volunteer_id: null,
        isCompleted: 1,
        admin_id: adminId
      };

      // Mock the SQL connection and query results
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({})
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      // Mock getRequestById to return the updated request
      Request.getRequestById = jest.fn().mockResolvedValue(mockUpdatedRequest);

      // Call the method
      const result = await Request.updateApproveRequest(requestId, adminId);

      // Assert the result
      expect(result).toEqual(mockUpdatedRequest);
    });

    it('should handle errors and throw them properly', async () => {
      const requestId = 'request123';
      const adminId = 'admin456';
      const mockError = new Error('Database error');

      // Mock SQL connection to throw an error
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockRejectedValue(mockError)
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      // Call the method and assert that it throws an error
      await expect(Request.updateApproveRequest(requestId, adminId)).rejects.toThrow('Database error');
    });
  });
  describe('getAcceptedRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('should return an array of Request objects', async () => {
      const mockRequests = [
        {
          request_id: 'request1',
          title: 'Request 1',
          category: 'Category A',
          description: 'Description 1',
          user_id: 'user1',
          volunteer_id: 'volunteer1',
          isCompleted: 0,
          admin_id: 'admin1'
        }
      ];

      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          query: jest.fn().mockResolvedValue({ recordset: mockRequests })
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      // Mock the Request constructor to return a dummy object
      jest.spyOn(Request.prototype, 'constructor').mockImplementation(function (...args) {
        this.request_id = args[0];
        this.title = args[1];
        this.category = args[2];
        this.description = args[3];
        this.user_id = args[4];
        this.volunteer_id = args[5];
        this.isCompleted = args[6];
        this.admin_id = args[7];
      });

      const result = await Request.getAcceptedRequest();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        request_id: 'request1',
        title: 'Request 1',
        category: 'Category A',
        description: 'Description 1',
        user_id: 'user1',
        volunteer_id: 'volunteer1',
        isCompleted: 0,
        admin_id: 'admin1'
      }));
    });

    it('should handle errors and throw them properly', async () => {
      const mockError = new Error('Database error');

      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          query: jest.fn().mockRejectedValue(mockError)
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      await expect(Request.getAcceptedRequest()).rejects.toThrow('Database error');
    });
  });
  describe('getCompletedRequest', () => {
    it('should return an array of Request objects', async () => {
      // Mock data to return from the database
      const mockRequests = [
        {
          request_id: 'request1',
          title: 'Request 1',
          category: 'Category A',
          description: 'Description 1',
          user_id: 'user1',
          volunteer_id: 'volunteer1',
          isCompleted: 1,
          admin_id: null
        }
      ];

      // Mock the database query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          query: jest.fn().mockResolvedValue({ recordset: mockRequests })
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      // Mock the Request constructor to return a dummy object
      jest.spyOn(Request.prototype, 'constructor').mockImplementation(function (...args) {
        this.request_id = args[0];
        this.title = args[1];
        this.category = args[2];
        this.description = args[3];
        this.user_id = args[4];
        this.volunteer_id = args[5];
        this.isCompleted = args[6];
        this.admin_id = args[7];
      });

      const result = await Request.getCompletedRequest();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        request_id: 'request1',
        title: 'Request 1',
        category: 'Category A',
        description: 'Description 1',
        user_id: 'user1',
        volunteer_id: 'volunteer1',
        isCompleted: 1,
        admin_id: null
      }));
    });

    it('should handle errors and throw them properly', async () => {
      const mockError = new Error('Database error');

      // Mock the database query to throw an error
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          query: jest.fn().mockRejectedValue(mockError)
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      await expect(Request.getCompletedRequest()).rejects.toThrow('Database error');
    });
  });
  describe('getApprovedRequest', () => {
    it('should return an array of Request objects', async () => {
      // Mock data to return from the database
      const mockRequests = [
        {
          request_id: 'request1',
          title: 'Request 1',
          category: 'Category A',
          description: 'Description 1',
          user_id: 'user1',
          volunteer_id: 'volunteer1',
          isCompleted: 0,
          admin_id: 'admin1'
        }
      ];

      // Mock the database query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          query: jest.fn().mockResolvedValue({ recordset: mockRequests })
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      // Mock the Request constructor to return a dummy object
      jest.spyOn(Request.prototype, 'constructor').mockImplementation(function (...args) {
        this.request_id = args[0];
        this.title = args[1];
        this.category = args[2];
        this.description = args[3];
        this.user_id = args[4];
        this.volunteer_id = args[5];
        this.isCompleted = args[6];
        this.admin_id = args[7];
      });

      const result = await Request.getApprovedRequest();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        request_id: 'request1',
        title: 'Request 1',
        category: 'Category A',
        description: 'Description 1',
        user_id: 'user1',
        volunteer_id: 'volunteer1',
        isCompleted: 0,
        admin_id: 'admin1'
      }));
    });

    it('should return an empty array when no approved requests are found', async () => {
      // Mock no data returned from the database
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          query: jest.fn().mockResolvedValue({ recordset: [] })
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      const result = await Request.getApprovedRequest();

      expect(result).toEqual([]);
    });

    it('should handle errors and throw them properly', async () => {
      const mockError = new Error('Database error');

      // Mock the database query to throw an error
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          query: jest.fn().mockRejectedValue(mockError)
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      await expect(Request.getApprovedRequest()).rejects.toThrow('Database error');
    });
  });
  describe('deleteRequest', () => {
    it('should delete a request and return true if rows are affected', async () => {
      // Mock result with affected rows
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn(),
          query: jest.fn().mockResolvedValue({ rowsAffected: [1] }) // Simulate successful deletion
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      const result = await Request.deleteRequest('request123');

      expect(result).toBe(true);
      expect(sql.connect).toHaveBeenCalled();
    });

    it('should return false if no rows are affected', async () => {
      // Mock result with no affected rows
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn(),
          query: jest.fn().mockResolvedValue({ rowsAffected: [0] }) // Simulate no deletion
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      const result = await Request.deleteRequest('request123');

      expect(result).toBe(false);
      expect(sql.connect).toHaveBeenCalled();
    });

    it('should handle errors and throw them properly', async () => {
      const mockError = new Error('Database error');

      // Mock the database query to throw an error
      sql.connect.mockResolvedValue({
        request: jest.fn().mockImplementation(() => ({
          input: jest.fn(),
          query: jest.fn().mockRejectedValue(mockError) // Simulate a query error
        })),
        close: jest.fn().mockResolvedValue(undefined)
      });

      await expect(Request.deleteRequest('request123')).rejects.toThrow('Database error');
    });
  });
});