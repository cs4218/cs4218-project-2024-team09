import { forgotPasswordController } from './authController.js';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import { hashPassword, comparePassword } from '../helpers/authHelper.js';
import JWT from 'jsonwebtoken';
import exp from 'constants';
import { describe } from 'node:test';
import { hash } from 'bcrypt';

jest.mock('../models/userModel.js');
jest.mock('../models/orderModel.js');
jest.mock('../helpers/authHelper.js');

/*
testcases:
1. no email
2. email invalid
3. no answer
4. no new pw
5. message if !user
6. pw reset success
7. error sth went wrong
*/

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

    it('BUG: should return error message if email is empty', async() => {
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

    it('BUG: should return error message if answer is empty', async() => {
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

    it('BUG: should return error message if newPassword is empty', async() => {
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

    it('should return error message if user does not exist', async () => {
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

    it('should reset password if user exists', async () => {
        req.body = {
            email: 'john@test.com',
            answer: 'answer',
            newPassword: 'newPassword'
        };
        const mockUser = { _id: 'user123' };
        userModel.findOne.mockResolvedValue(mockUser);
        hashPassword.mockResolvedValue('hashedpassword');
        userModel.findByIdAndUpdate.mockResolvedValue(mockUser);
    
        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(200);
        expect(res._getData()).toEqual({
            success: true,
            message: "Password Reset Successfully",
        });
    });

    it('BUG: doesnt handle error in registration', async () => {
        // Arrange
        req.body = {
            email: 'john@test.com',
            answer: 'answer',
            newPassword: 'newPassword'
        };
        const error = new Error("Something went wrong");
        userModel.findOne.mockRejectedValue(error); // Simulate existing user

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await forgotPasswordController(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(error);
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toEqual({
            success: false,
            message: "Something went wrong"
        });
    });
});