import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import userModel from '../models/userModel';
import categoryModel from '../models/categoryModel';
import productModel from '../models/productModel';
import mongoose from 'mongoose';
import { hashPassword } from '../helpers/authHelper';

dotenv.config();

let mockUserId;
let mockCategoryId;
let mockProductId;
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

  const mockCategory = new categoryModel({
    name: 'Mock',
    slug: 'mock-slug'
  });
  await mockCategory.save();
  mockCategoryId = mockCategory._id;

  const mockProduct = new productModel({
    name: 'Mock Product',
    slug: 'mock-slug',
    description: '1 mock',
    price: 3,
    category: mockCategory._id,
    quantity: 1
  });
  await mockProduct.save();
  mockProductId = mockProduct._id;
});


test('User can log in, make an order, and see it reflected', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');

  // Fill in login form and submit
  await page.getByPlaceholder('Enter Your Email').fill('mockuser@email.com');
  await page.getByPlaceholder('Enter Your Password').fill(mockPassword);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Navigate to profile page
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();

  // Navigate to cart
  await page.locator('a.nav-link:has-text("Cart")').click();

  // Use card to pay
  await page.getByRole('button', { name: 'Paying with Card' }).click();
  
  // Fill card details
  await page.frameLocator('iframe[name="braintree-hosted-field-number"]').getByPlaceholder('•••• •••• •••• ••••').fill('4111 1111 1111 1111');
  await page.frameLocator('iframe[name="braintree-hosted-field-expirationDate"]').getByPlaceholder('MM/YY').fill('11/31');
  await page.frameLocator('iframe[name="braintree-hosted-field-cvv"]').getByPlaceholder('•••').fill('251');

  // Make payment
  await page.getByRole('button', { name: 'Make Payment' }).click()

  // Redirects to order page, order is reflected
  await expect(page.getByRole('cell', { name: 'Success' })).toBeVisible({timeout:5000});
  await expect(page.getByRole('cell', { name: 'Mock User' })).toBeVisible({timeout:5000});
  await expect(page.getByRole('cell', { name: 'Not Process' })).toBeVisible({timeout:5000});
});

test.afterAll( async () => { 
  await productModel.deleteMany({ _id: mockProductId });
  await categoryModel.deleteMany({ _id: mockCategoryId });
  await userModel.deleteMany({ _id: mockUserId });

  mongoose.disconnect();
});