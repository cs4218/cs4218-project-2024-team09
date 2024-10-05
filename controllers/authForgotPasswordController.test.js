import { forgotPasswordController } from './authController.js';
import userModel from '../models/userModel.js';
import { hashPassword } from '../helpers/authHelper.js';

jest.mock('../models/userModel.js');
jest.mock('../models/orderModel.js');
jest.mock('../helpers/authHelper.js');

describe('forgotPasswordController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
        body: {},
        user: {},
        };

        res = {
        statusCode: 200,
        status: jest.fn().mockImplementation((code) => {
            res.statusCode = code;
            return res;
        }),
        send: jest.fn().mockImplementation((data) => {
            res.data = data;
            return res;
        }),
        json: jest.fn().mockImplementation((data) => {
            res.data = data;
            return res;
        }),
        _getData: function() {
            return this.data;
        },
        };
    });

    it('BUG: should throw error if email is empty', async() => {
        // Arrange
        req.body = {
            email: '',
            answer: 'answer',
            newPassword: 'newPassword'
        }
        
        // Action
        await forgotPasswordController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ error: "Emai is Required" });
        expect(res.statusCode).toBe(400);
    })

    it('BUG: should throw error if email is invalid', async() => {
        // Arrange
        req.body = {
            email: 'johnEmail',
            answer: 'answer',
            newPassword: 'newPassword'
        }
        
        // Action
        await forgotPasswordController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ error: "Emai is Required" });
        expect(res.statusCode).toBe(400);
    })

    it('BUG: should throw error if answer is empty', async() => {
        // Arrange
        req.body = {
            email: 'john@test.com',
            answer: '',
            newPassword: 'newPassword'
        }
        
        // Action
        await forgotPasswordController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ error: "answer is Required" });
        expect(res.statusCode).toBe(400);
    })

    it('BUG: should throw error if newPassword is empty', async() => {
        // Arrange
        req.body = {
            email: 'john@test.com',
            answer: 'answer',
            newPassword: ''
        }
        
        // Action
        await forgotPasswordController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ error: "New Password is Required" });
        expect(res.statusCode).toBe(400);
    })

    it('should throw error if user does not exist', async () => {
        // Arrange
        req.body = {
            email: 'john@test.com',
            answer: 'answer',
            newPassword: 'newPassword'
        };
        userModel.findOne.mockResolvedValue(null);

        // Action
        await forgotPasswordController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(404);
        expect(res._getData()).toEqual({
            success: false,
            message: "Wrong Email Or Answer"
        });
    });

    it('should successfully reset password if user exists', async () => {
        // Arrange
        req.body = {
            email: 'john@test.com',
            answer: 'answer',
            newPassword: 'newPassword'
        };
        const mockUser = { _id: 'user123' };
        userModel.findOne.mockResolvedValue(mockUser);
        hashPassword.mockResolvedValue('hashedpassword');
        userModel.findByIdAndUpdate.mockResolvedValue(mockUser);
    
        // Action
        await forgotPasswordController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(200);
        expect(res._getData()).toEqual({
            success: true,
            message: "Password Reset Successfully",
        });
    });

    it('should prevent password reset if error is thrown during the reset process', async () => {
        // Arrange
        req.body = {
            email: 'john@test.com',
            answer: 'answer',
            newPassword: 'newPassword'
        };
        const error = new Error("Something went wrong");
        userModel.findOne.mockRejectedValue(error); // Simulate existing user
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // Action  
        await forgotPasswordController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(error);
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toEqual({
            success: false,
            message: "Something went wrong",
            error
        });
    });
});