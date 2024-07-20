const requestController = require('../controllers/requestController');
const db = require('../middleware/db');
const sql = require('mssql');
const Request = require('../models/request');
const {getRequestByUserId,
    createRequest,
    getAvailableRequest,
    updateAcceptedRequest,
    getAcceptedRequestById,
    updateCompletedRequest,
    getRequestById,
    getUserDetailsById,
    updateApproveRequest,
    getAcceptedRequest,
    getCompletedRequest,
    getApprovedRequest,
    deleteRequest } = require('../controllers/requestController');

// Mock the required modules
jest.mock('../models/request');

// Mock the required functions
jest.mock('../controllers/requestController', () => ({
    ...jest.requireActual('../controllers/requestController')
}));
jest.mock('../middleware/db', () => {
    const mockPool = {
        connect: jest.fn(),
        request: jest.fn(),
        close: jest.fn(),
        // Add other methods as needed
    };

    const poolPromise = new Promise((resolve, reject) => {
        // Resolve with the mock pool
        resolve(mockPool);
    });

    return {
        sql: jest.requireActual('mssql'), // Use actual mssql library for `sql` part
        poolPromise, // Export the mocked poolPromise
    };
});

// Test suite for requestController
describe('Request Controller', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getRequestByUserId', () => {
        it('should return requests for a given user ID', async () => {
            req.params.id = '123';
            const mockRequests = [{ id: '1', request: 'Sample request' }];
            Request.getRequestByUserId = jest.fn().mockResolvedValue(mockRequests);

            await requestController.getRequestByUserId(req, res);

            expect(Request.getRequestByUserId).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });


        it('should handle no requests found for a given user ID', async () => {
            req.params.id = '123';
            Request.getRequestByUserId = jest.fn().mockResolvedValue(null);

            await requestController.getRequestByUserId(req, res);

            expect(Request.getRequestByUserId).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('No requests found for this user');
        });

        it('should handle errors while retrieving requests', async () => {
            req.params.id = '123';
            Request.getRequestByUserId = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getRequestByUserId(req, res);

            expect(Request.getRequestByUserId).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving requests');
        });
    });

    describe('createRequest', () => {
        it('should create a new request and return it', async () => {
            req.body = { request: 'New request' };
            const createdRequest = { id: '1', ...req.body };
            Request.createRequest = jest.fn().mockResolvedValue(createdRequest);

            await requestController.createRequest(req, res);

            expect(Request.createRequest).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdRequest);
        });

        it('should handle errors while creating a new request', async () => {
            req.body = { request: 'New request' };
            Request.createRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.createRequest(req, res);

            expect(Request.createRequest).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error creating request');
        });
    });

    describe('getAvailableRequest', () => {
        it('should return all available requests', async () => {
            const mockRequests = [{ id: '1', request: 'Available request' }];
            Request.getAvailableRequests = jest.fn().mockResolvedValue(mockRequests);

            await requestController.getAvailableRequest(req, res);

            expect(Request.getAvailableRequests).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });

        it('should handle no available requests found', async () => {
            Request.getAvailableRequests = jest.fn().mockResolvedValue(null);

            await requestController.getAvailableRequest(req, res);

            expect(Request.getAvailableRequests).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('No available requests found');
        });

        it('should handle errors while retrieving available requests', async () => {
            Request.getAvailableRequests = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getAvailableRequest(req, res);

            expect(Request.getAvailableRequests).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving available requests');
        });
    });

    describe('updateAcceptedRequest', () => {
        it('should update an accepted request with a new volunteer ID', async () => {
            req.params.id = '1';
            req.body.volunteer_id = '456';
            const updatedRequest = { id: req.params.id, volunteer_id: req.body.volunteer_id };
            Request.updateAcceptedRequest = jest.fn().mockResolvedValue(updatedRequest);

            await requestController.updateAcceptedRequest(req, res);

            expect(Request.updateAcceptedRequest).toHaveBeenCalledWith(req.params.id, req.body.volunteer_id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedRequest);
        });

        it('should handle errors while updating an accepted request', async () => {
            req.params.id = '1';
            req.body.volunteer_id = '456';
            Request.updateAcceptedRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.updateAcceptedRequest(req, res);

            expect(Request.updateAcceptedRequest).toHaveBeenCalledWith(req.params.id, req.body.volunteer_id);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error updating accepted request');
        });
    });

    describe('getAcceptedRequestById', () => {
        it('should return accepted requests by volunteer ID', async () => {
            req.params.id = '456';
            const mockRequests = [{ id: '1', request: 'Accepted request' }];
            Request.getAcceptedRequestById = jest.fn().mockResolvedValue(mockRequests);

            await requestController.getAcceptedRequestById(req, res);

            expect(Request.getAcceptedRequestById).toHaveBeenCalledWith('456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });

        it('should handle no accepted requests found for volunteer ID', async () => {
            req.params.id = '456';
            Request.getAcceptedRequestById = jest.fn().mockResolvedValue(null);

            await requestController.getAcceptedRequestById(req, res);

            expect(Request.getAcceptedRequestById).toHaveBeenCalledWith('456');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('No accepted requests found for this volunteer');
        });

        it('should handle errors while retrieving accepted requests by volunteer ID', async () => {
            req.params.id = '456';
            Request.getAcceptedRequestById = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getAcceptedRequestById(req, res);

            expect(Request.getAcceptedRequestById).toHaveBeenCalledWith('456');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving accepted requests');
        });
    });

    describe('updateCompletedRequest', () => {
        it('should update request to completed', async () => {
            req.params.id = '1';
            const updatedRequest = { id: req.params.id, status: 'completed' };
            Request.updateCompletedRequest = jest.fn().mockResolvedValue(updatedRequest);

            await requestController.updateCompletedRequest(req, res);

            expect(Request.updateCompletedRequest).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedRequest);
        });

        it('should handle errors while updating request to completed', async () => {
            req.params.id = '1';
            Request.updateCompletedRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.updateCompletedRequest(req, res);

            expect(Request.updateCompletedRequest).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error updating request to completed');
        });
    });

    describe('getRequestById', () => {
        it('should return a request by ID', async () => {
            req.params.id = '1';
            const mockRequest = { id: '1', request: 'Sample request' };
            Request.getRequestById = jest.fn().mockResolvedValue(mockRequest);

            await requestController.getRequestById(req, res);

            expect(Request.getRequestById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequest);
        });

        it('should handle request not found by ID', async () => {
            req.params.id = '1';
            Request.getRequestById = jest.fn().mockResolvedValue(null);

            await requestController.getRequestById(req, res);

            expect(Request.getRequestById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('Request not found');
        });

        it('should handle errors while retrieving request by ID', async () => {
            req.params.id = '1';
            Request.getRequestById = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getRequestById(req, res);

            expect(Request.getRequestById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving request');
        });
    });

    describe('getUserDetailsById', () => {
        it('should return user details by ID', async () => {
            req.params.id = '123';
            const mockUser = { id: '123', name: 'John Doe' };
            Request.getUserDetailsById = jest.fn().mockResolvedValue(mockUser);

            await requestController.getUserDetailsById(req, res);

            expect(Request.getUserDetailsById).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should handle user not found by ID', async () => {
            req.params.id = '123';
            Request.getUserDetailsById = jest.fn().mockResolvedValue(null);

            await requestController.getUserDetailsById(req, res);

            expect(Request.getUserDetailsById).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('User not found');
        });

        it('should handle errors while retrieving user details by ID', async () => {
            req.params.id = '123';
            Request.getUserDetailsById = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getUserDetailsById(req, res);

            expect(Request.getUserDetailsById).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving user details');
        });
    });

    describe('updateApproveRequest', () => {
        it('should approve a request and return the updated request', async () => {
            req.params.id = '1';
            req.body.admin_id = 'admin123';
            const approvedRequest = { id: '1', admin_id: 'admin123' };
            Request.updateApproveRequest = jest.fn().mockResolvedValue(approvedRequest);

            await requestController.updateApproveRequest(req, res);

            expect(Request.updateApproveRequest).toHaveBeenCalledWith(req.params.id, req.body.admin_id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(approvedRequest);
        });

        it('should handle errors while approving a request', async () => {
            req.params.id = '1';
            req.body.admin_id = 'admin123';
            Request.updateApproveRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.updateApproveRequest(req, res);

            expect(Request.updateApproveRequest).toHaveBeenCalledWith(req.params.id, req.body.admin_id);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error approving request');
        });
    });

    describe('getAcceptedRequest', () => {
        it('should return all accepted requests', async () => {
            const mockRequests = [{ id: '1', request: 'Accepted request' }];
            Request.getAcceptedRequest = jest.fn().mockResolvedValue(mockRequests);

            await requestController.getAcceptedRequest(req, res);

            expect(Request.getAcceptedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });

        it('should handle no accepted requests found', async () => {
            Request.getAcceptedRequest = jest.fn().mockResolvedValue(null);

            await requestController.getAcceptedRequest(req, res);

            expect(Request.getAcceptedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('No accepted requests found');
        });

        it('should handle errors while retrieving accepted requests', async () => {
            Request.getAcceptedRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getAcceptedRequest(req, res);

            expect(Request.getAcceptedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving accepted requests');
        });
    });

    describe('getCompletedRequest', () => {
        it('should return all completed requests', async () => {
            const mockRequests = [{ id: '1', request: 'Completed request' }];
            Request.getCompletedRequest = jest.fn().mockResolvedValue(mockRequests);

            await requestController.getCompletedRequest(req, res);

            expect(Request.getCompletedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });

        it('should handle no completed requests found', async () => {
            Request.getCompletedRequest = jest.fn().mockResolvedValue(null);

            await requestController.getCompletedRequest(req, res);

            expect(Request.getCompletedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('No completed requests found');
        });

        it('should handle errors while retrieving completed requests', async () => {
            Request.getCompletedRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getCompletedRequest(req, res);

            expect(Request.getCompletedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving completed requests');
        });
    });

    describe('getApprovedRequest', () => {
        it('should return all approved requests', async () => {
            const mockRequests = [{ id: '1', request: 'Approved request' }];
            Request.getApprovedRequest = jest.fn().mockResolvedValue(mockRequests);

            await requestController.getApprovedRequest(req, res);

            expect(Request.getApprovedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });

        it('should handle no approved requests found', async () => {
            Request.getApprovedRequest = jest.fn().mockResolvedValue(null);

            await requestController.getApprovedRequest(req, res);

            expect(Request.getApprovedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('No approved requests found');
        });

        it('should handle errors while retrieving approved requests', async () => {
            Request.getApprovedRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.getApprovedRequest(req, res);

            expect(Request.getApprovedRequest).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving approved requests');
        });
    });

    describe('deleteRequest', () => {
        it('should delete a request by ID and return success message', async () => {
            req.params.id = '1';
            Request.deleteRequest = jest.fn().mockResolvedValue(true);

            await requestController.deleteRequest(req, res);

            expect(Request.deleteRequest).toHaveBeenCalledWith('1');
            expect(res.send).toHaveBeenCalledWith('Request deleted successfully');
        });

        it('should handle request not found while deleting', async () => {
            req.params.id = '1';
            Request.deleteRequest = jest.fn().mockResolvedValue(false);

            await requestController.deleteRequest(req, res);

            expect(Request.deleteRequest).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('Request not found');
        });

        it('should handle errors while deleting a request', async () => {
            req.params.id = '1';
            Request.deleteRequest = jest.fn().mockRejectedValue(new Error('Error'));

            await requestController.deleteRequest(req, res);

            expect(Request.deleteRequest).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error deleting request');
        });
    });
});