import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Orders from "./Orders";
import mongoose from "mongoose";
import * as Auth from '../../context/auth';
import userModel from "../../../../models/userModel";
import categoryModel from "../../../../models/categoryModel";
import productModel from "../../../../models/productModel";
import orderModel from "../../../../models/orderModel";
import { hashPassword } from "../../../../helpers/authHelper";
import axios from "axios";
import connectDB from "../../../../config/db"
import dotenv from "dotenv";

dotenv.config();

jest.mock("../../components/Layout", () => {
  return ({children}) => <>{children}</>
})
jest.mock("../../components/UserMenu", () => {
  return () => <></>
})

describe("Order Fetch Integration Testing", () => {
  let mockUserId;
  let mockAdminUserId;
  let mockCategoryId;
  let mockProductId;
  let mockOrderId;
  const mockPassword = 'mockpassword';
  const mockAdminPassword = 'mockadminpassword';

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

    const mockAdminUser = new userModel({
      name: 'Mock Admin User',
      email: 'mockadminuser@email.com',
      password: await hashPassword(mockAdminPassword),
      phone: '12345678',
      address: 'Test address',
      answer: 'Test answer'
    })
    await mockAdminUser.save()

    const mockCategory = new categoryModel({
      name: 'Mock',
      slug: 'mock-slug'
    })
    await mockCategory.save();

    const mockProduct = new productModel({
      name: 'Mock Product',
      slug: 'mockproduct-slug',
      description: 'mock description',
      price: 3,
      category: mockCategory._id,
      quantity: 1
    });
    await mockProduct.save()

    const mockOrder = new orderModel({
      products: [mockProduct._id],
      payment: {
        transaction: {},
        success: true
      },
      buyer: mockUser._id,
      status: 'Not Process'
    });
    await mockOrder.save()
    
    mockUserId = mockUser._id;
    mockAdminUserId = mockAdminUser._id;
    mockCategoryId = mockCategory._id;
    mockProductId = mockProduct._id;
    mockOrderId = mockOrder._id;
  });
  
  afterAll( async () => { 
    await orderModel.deleteMany({ _id: mockOrderId });
    await productModel.deleteMany({ _id: mockProductId });
    await categoryModel.deleteMany({ _id: mockCategoryId });
    await userModel.deleteMany({ _id: mockUserId });
    await userModel.deleteMany({ _id: mockAdminUserId });
  
    mongoose.disconnect();
  });

  it("should retrieve and display orders from MongoDB", async () => {
    // Problem: jest is not configured to proxy frontend routes to backend.
    // In this case, we are not able to workaround it as there is an internal call
    // to the orders that we cannot mock.
    // As a result, this test will fail due to original code and configuration fault.
    const { data } = await axios.post("http://localhost:6060/api/v1/auth/login", {
      email: 'mockuser@email.com',
      password: mockPassword
    })
    jest.spyOn(Auth, "useAuth").mockReturnValue([{ user: data.user, token: data.token }])

    render(
      <Orders />
    );

    // Ensure there is an order
    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
    expect(screen.getByText("Not Process")).toBeInTheDocument();
    expect(screen.getByText("Mock User")).toBeInTheDocument();
  });

  it("should show an order status update if it is updated by an admin", async () => {
    const userData = await axios.post("http://localhost:6060/api/v1/auth/login", {
      email: 'mockuser@email.com',
      password: mockPassword
    });
    jest.spyOn(Auth, "useAuth").mockReturnValueOnce([{ user: userData.data.user, token: userData.data.token }])
    render(
      <Orders />
    );

    // Ensure there is an order with the status "Not Process"
    await waitFor(() => {
      expect(screen.getByText("Not Process")).toBeInTheDocument();
    });

    const adminData = await axios.post("http://localhost:6060/api/v1/auth/login", {
      email: 'mockadminuser@email.com',
      password: mockAdminPassword
    });
    // Update order status
    await axios.put(`http://localhost:6060/api/v1/auth/order-status/${mockOrderId}`, {
      status: "Processing"
    }, { headers: {'authorization' : adminData.token} })

    jest.spyOn(Auth, "useAuth").mockReturnValueOnce([{ user: userData.data.user, token: userData.data.token }])
    render(
      <Orders />
    );

    // Ensure there is an order with the status "Processing"
    await waitFor(() => {
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });
  })
});