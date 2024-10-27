import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import userModel from '../models/userModel';
import mongoose from 'mongoose';
import { hashPassword } from '../helpers/authHelper';

dotenv.config();

let mockUserId;
const mockPassword = 'mockpassword';

test.beforeAll( async () => {
  await mongoose.connect(process.env.MONGO_URL);

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


test('User can log in, update profile name, and see it reflected', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');

  // Fill in login form and submit
  await page.getByPlaceholder('Enter Your Email').fill('mockuser@email.com');
  await page.getByPlaceholder('Enter Your Password').fill(mockPassword);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Navigate to profile page
  await page.locator('a.nav-link.dropdown-toggle:has-text("Mock User")').click();
  await page.locator('a.dropdown-item:has-text("Dashboard")').click();

  // Navigate to Profile
  await page.locator('a.list-group-item-action:has-text("Profile")').click();

  // Fill Profile Form
  await page.getByPlaceholder('Enter Your Name').fill("New Mock User");
  await page.getByRole('button', { name: 'UPDATE' }).click();

  // Wait for toast notification
  await expect(page.getByText('Profile Updated Successfully')).toBeVisible({timeout:5000});
  
  // Go to dashboard
  await page.goto('http://localhost:3000/dashboard/user');

  // Check both dashboard name and navbar button
  await expect(page.getByRole('heading', { name: 'New Mock User' })).toContainText('New Mock User');
  await expect(page.getByRole('button', { name: 'New Mock User' })).toContainText('New Mock User');
});

test.afterAll( async () => { 
  await userModel.deleteMany({ _id: mockUserId });

  mongoose.disconnect();
});