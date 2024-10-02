import { registerController } from './authController.js';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import { hashPassword, comparePassword } from '../helpers/authHelper.js';
import JWT from 'jsonwebtoken';
import exp from 'constants';

jest.mock('../models/userModel.js');
jest.mock('../models/orderModel.js');
jest.mock('../helpers/authHelper.js');

describe('registerController', () => {
    let req, res;

    beforeEach(() => {
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


    it('should return an error if name is missing', async () => {
        // Arrange
        req.body = {
            name: '',
            email: 'john@test.com',
            password: 'password',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: 'answer'
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ error: "Name is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('should return an error if email is missing', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: '',
            password: 'password',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: 'answer'
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ message: "Email is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('BUG: should return an error if email is invalid', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'myEmail',
            password: 'password',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: 'answer'
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ message: "Email is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('should return an error if password is missing', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'john@test.com',
            password: '',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: 'answer'
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ message: "Password is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('should return an error if phone is missing', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'test@test.com',
            password: 'password',
            phone: '',
            address: 'Serangoon',
            answer: 'answer'
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ message: "Phone no is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('BUG: should return an error if phone is invalid', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'test@test.com',
            password: 'password',
            phone: 'phonenumber',
            address: 'Serangoon',
            answer: 'answer'
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ message: "Phone no is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('should return an error if address is missing', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'test@test.com',
            password: 'password',
            phone: '1234 5678',
            address: '',
            answer: 'answer'
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ message: "Address is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('should return an error if answer is missing', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'test@test.com',
            password: 'password',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: ''
        };

        // Action
        await registerController(req, res);

        // Assert
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res._getData()).toEqual({ message: "Answer is Required" });
        expect(res.statusCode).toBe(200);
    });

    it('should register a new user successfully if user does not exist yet', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'john@test.com',
            password: 'password',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: 'answer',
        };
        userModel.findOne.mockResolvedValue(null);
        hashPassword.mockResolvedValue('hashedPassword');
        userModel.mockImplementation(() => {
            return {
            save: jest.fn().mockResolvedValue(req.body),
            };
        });

        // Action
        await registerController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(201);
        expect(res._getData()).toEqual({
            success: true,
            message: "User Register Successfully",
            user: req.body,
        });
    });

    it('should return message if user already exists', async () => {
        req.body = {
            name: 'John',
            email: 'john@test.com',
            password: 'password',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: 'answer'
        };
        userModel.findOne.mockResolvedValue(req.body); // Simulate existing user

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(200);
        expect(res._getData()).toEqual({
            success: false,
            message: "Already Register please login",
        });
    });

    it('BUG: doesnt handle error in registration', async () => {
        // Arrange
        req.body = {
            name: 'John',
            email: 'john@test.com',
            password: 'password',
            phone: '1234 5678',
            address: 'Serangoon',
            answer: 'answer'
        };
        const error = new Error("Error in registration");
        userModel.findOne.mockRejectedValue(error); // Simulate existing user

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await registerController(req, res);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(error);
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toEqual({
            success: false,
            message: "Errro in Registeration"
        });
    });
});