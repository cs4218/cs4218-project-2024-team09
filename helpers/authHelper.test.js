import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from './authHelper';

jest.mock('bcrypt');

describe('hashPassword', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('should hash a plaintext password successfully', async () => {
        // Arrange
        const password = 'myPassword';
        const hashedPassword = 'hashedPassword';
        bcrypt.hash.mockResolvedValue(hashedPassword);

        // Action
        const result = await hashPassword(password);

        // Assert
        expect(result).toBe(hashedPassword);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should handle error during hashing', async () => {
        // Arrange
        const password = 'myPassword';
        const error = new Error('Hashing failed');
        bcrypt.hash.mockRejectedValue(error);
        
        // Action
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const result = await hashPassword(password);
        
        // Assert
        expect(result).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
})

describe('comparePassword', () => {
    const password = 'myPassword';
    const hashedPassword = 'hashedPassword';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return true if passwords match', async () => {
        // Arrange
        bcrypt.compare.mockResolvedValue(true);
        
        // Action
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(result).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false if passwords do not match', async () => {
        // Arrange
        bcrypt.compare.mockResolvedValue(false);
        
        // Action
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(result).toBe(false);
    });

    it('BUG: should handle error if bcrypt.compare() throws an error', async () => {
        // Arrange
        const error = new Error('Compare failed');
        bcrypt.compare.mockRejectedValue(error);

        // Action
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(result).toBe(undefined);
    })
});