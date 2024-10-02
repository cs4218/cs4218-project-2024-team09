import bcrypt from 'bcrypt';
import { jest } from '@jest/globals';
import { hashPassword, comparePassword } from './authHelper'; // adjust the path if necessary
import { afterEach, describe } from 'node:test';

jest.mock('bcrypt');

describe('hashPassword', () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    it('hashPassword should hash the password successfully', async () => {
        // Arrange
        const password = 'myPassword';
        const hashedPassword = 'hashedPassword';
        bcrypt.hash.mockResolvedValue(hashedPassword); // Simulate successful hashing
        
        // Action
        const result = await hashPassword(password);

        // Assert
        expect(result).toBe(hashedPassword);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10); // Ensure hash is called with correct salt rounds
    });

    it('hashPassword should handle error during hashing', async () => {
        // Arrange
        const password = 'myPassword';
        const error = new Error('Hashing failed');
        bcrypt.hash.mockRejectedValue(error); // Simulate a failure in bcrypt.hash
        
        // Action
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log to check error output
        const result = await hashPassword(password);
        
        // Assert
        expect(result).toBeUndefined(); // When an error occurs, the function returns undefined
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
})

describe('comparePassword', () => {
    const password = 'myPassword';
    const hashedPassword = 'hashedPassword';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('comparePassword should return true if passwords match', async () => {
        // Arrange
        bcrypt.compare.mockResolvedValue(true); // Simulate successful comparison
        
        // Action
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(result).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('comparePassword should return false if passwords do not match', async () => {
        // Arrange
        bcrypt.compare.mockResolvedValue(false); // Simulate passwords not matching
        
        // Action
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(result).toBe(false);
    });

    it('BUG: comparePassword should return if bcryp.compare() throws an error', async () => {
        // Arrange
        const error = new Error('Compare failed');
        bcrypt.compare.mockRejectedValue(error);

        // Action
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(result).toBe(undefined);
    })
});