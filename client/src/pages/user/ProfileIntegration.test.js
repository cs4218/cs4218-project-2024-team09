// Note: In order to run this successfully, you must have an instance of 
// server running in the background, since jest is not configured to proxy requests
// from frontend to backend.

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import * as Auth from '../../context/auth'
import Profile from "./Profile";
import mongoose from "mongoose";
import userModel from "../../../../models/userModel"
import dotenv from "dotenv";
import connectDB from "../../../../config/db"
import { hashPassword } from "../../../../helpers/authHelper";
import axios from "axios";

dotenv.config()

jest.mock("../../components/Layout", () => {
  return ({children}) => <>{children}</>
})
jest.mock("../../components/UserMenu", () => {
  return () => <></>
})

describe("Profile Integration Testing", () => {
  let mockUser;
  let mockUserId;
  const mockPassword = 'mockpassword';

  beforeAll( async () => {
    connectDB();
  
    mockUser = new userModel({
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

  describe('Given an authenticated user', () => {
    it('useAuth populates user data in Profile correctly', async () => {
      // Problem: jest is not configured to proxy frontend routes to backend.
      // Workaround: Directly communicate with backend to get a response, then use the response by mocking
      // so that the component can get a legit response.
      const { data } = await axios.post("http://localhost:6060/api/v1/auth/login", {
        email: 'mockuser@email.com',
        password: mockPassword
      })
      jest.spyOn(Auth, "useAuth").mockReturnValue([{ user: data.user, token: data.token }])

      render(
        <Profile />
      );

      await waitFor(() =>
        expect(screen.getByPlaceholderText(/Enter Your Name/i).value).toBe(
          mockUser.name
        )
      );
      expect(screen.getByPlaceholderText(/Enter Your Email/i).value).toBe(
        mockUser.email
      );
      expect(screen.getByPlaceholderText(/Enter Your Phone/i).value).toBe(
        mockUser.phone
      );
      expect(screen.getByPlaceholderText(/Enter Your Address/i).value).toBe(
        mockUser.address
      );
    })

    it("should be able to update user data in MongoDB", async () => {
      const { data } = await axios.post("http://localhost:6060/api/v1/auth/login", {
        email: 'mockuser@email.com',
        password: mockPassword
      })
      jest.spyOn(Auth, "useAuth").mockReturnValue([{ user: data.user, token: data.token }])

      render(
        <Profile />
      );
  
      fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
        target: { value: "New Mock Name" }
      });

      // As mentioned above, there is a bug in jest configuration.
      // We will mock handleSubmit here, so that it routes to backend
      // Our aim here is to test if we can connect to MongoDB 
      // and update the data, not if the button works.
      await axios.put("http://localhost:6060/api/v1/auth/profile", {
        name: "New Mock Name",
        email: mockUser.email,
        password: mockUser.password,
        address: mockUser.address,
        phone: mockUser.phone,
      }, { headers: {'authorization' : data.token} })
  
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter Your Name").value).toBe("New Mock Name");
      });
  
      const updatedUser = await userModel.findById(mockUser._id);
      expect(updatedUser.name).toBe("New Mock Name");
    });
  })
})
