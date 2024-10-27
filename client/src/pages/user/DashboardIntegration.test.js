// Note: In order to run this successfully, you must have an instance of 
// server running in the background, since jest is not configured to proxy requests
// from frontend to backend.

import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import * as Auth from '../../context/auth';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from "react-router-dom";
import mongoose from "mongoose";
import userModel from "../../../../models/userModel";
import { hashPassword } from "../../../../helpers/authHelper";
import axios from "axios";
import connectDB from "../../../../config/db"
import dotenv from "dotenv";

dotenv.config();

// Mocking the Layout component
jest.mock("../../components/Layout", () => {
  return ({ children }) => <>{children}</>;
});

// Mocking react-router-dom functions
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({ pathname: "/some-path" })),
}));

describe("Dashboard Integration Testing", () => {
  let mockUserId;
  const mockPassword = 'mockpassword';

  beforeAll( async () => {
    connectDB();
  
    const mockUser = new userModel({
      name: 'Mock User',
      email: 'mockuser@email.com',
      password: await hashPassword(mockPassword),
      phone: '12345678',
      address: 'Test address',
      answer: 'Test answer'
    })
  
    await mockUser.save();
    mockUserId = mockUser._id;
  });
  
  afterAll( async () => { 
    await userModel.deleteMany({ _id: mockUserId });
  
    mongoose.disconnect();
  });

  it("should be able to connect with MongoDB and display UserMenu in the Dashboard", async () => {
    // Problem: jest is not configured to proxy frontend routes to backend.
    // Workaround: Directly communicate with backend to get a response, then use the response by mocking
    // so that the component can get a legit response.
    const { data } = await axios.post("http://localhost:6060/api/v1/auth/login", {
      email: 'mockuser@email.com',
      password: mockPassword
    })
    jest.spyOn(Auth, "useAuth").mockReturnValue([{ user: data.user, token: data.token }])

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument(); 
    expect(screen.getByText("Profile")).toBeInTheDocument(); 
    expect(screen.getByText("Orders")).toBeInTheDocument(); 
  });
});
