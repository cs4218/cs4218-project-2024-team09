import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";

// Mock JWT and userModel
jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe("requireSignIn Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: { authorization: "" } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() if token is valid", async () => {
    // Arrange
    const mockToken = { _id: "123" };
    JWT.verify.mockReturnValue(mockToken);
    req.headers.authorization = "Bearer validToken";
    
    // Action
    await requireSignIn(req, res, next);

    // Assert
    expect(JWT.verify).toHaveBeenCalledWith("Bearer validToken", process.env.JWT_SECRET);
    expect(req.user).toEqual(mockToken);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should throw error if invalid token", async () => {
    // Arrange
    JWT.verify.mockImplementation(() => { throw new Error("Invalid token"); });
    req.headers.authorization = "Bearer invalidToken";
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Action
    await requireSignIn(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)); // Check if an error object was logged
    expect(consoleSpy.mock.calls[0][0].message).toBe("Invalid token"); // Check the error message

    consoleSpy.mockRestore(); // Clean up the spy
  });

  it("should throw error if missing token", async () => {
    // Arrange
    JWT.verify.mockImplementation(() => { throw new Error("Missing token"); });
    req.headers.authorization = null;
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Assert
    await requireSignIn(req, res, next);

    // Action
    expect(next).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleSpy.mock.calls[0][0].message).toBe("Missing token"); // Check the error message   
  });

  it("should throw error if expired token", async () => {
    // Arrange
    JWT.verify.mockImplementation(() => { throw new Error("Token expired"); });
    req.headers.authorization = "Bearer expiredToken";
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Action
    await requireSignIn(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleSpy.mock.calls[0][0].message).toBe("Token expired"); // Check the error message 
  });

  it("should throw error if token has missing signature", async () => {
    // Arrange
    JWT.verify.mockImplementation(() => { throw new Error("Missing signature"); });
    req.headers.authorization = "Bearer tokenWithoutSignature";
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Action
    await requireSignIn(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleSpy.mock.calls[0][0].message).toBe("Missing signature"); // Check the error message 
  });
});

describe("isAdmin Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: "123" } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next for admin users", async () => {
    // Arrange
    userModel.findById.mockResolvedValue({ _id: "123", role: 1 });

    // Action
    await isAdmin(req, res, next);

    // Assert
    expect(userModel.findById).toHaveBeenCalledWith("123");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should deny access for non-admin users", async () => {
    // Arrange
    userModel.findById.mockResolvedValue({ _id: "123", role: 0 });

    // Action
    await isAdmin(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "UnAuthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw error if missing user", async () => {
    // Arrange
    userModel.findById.mockResolvedValue(null);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const error = new TypeError("Cannot read properties of null (reading 'role')");

    // Action
    await isAdmin(req, res, next);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleSpy.mock.calls[0][0].message).toBe("Cannot read properties of null (reading 'role')");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: "Error in admin middleware",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle undefined user role", async () => {
    // Arrange
    userModel.findById.mockResolvedValue({ _id: "123", role: undefined });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Action
    await isAdmin(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "UnAuthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
