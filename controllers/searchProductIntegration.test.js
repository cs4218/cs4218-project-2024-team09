import productModel from '../models/productModel';
import { searchProductController } from './productController';
import dotenv from "dotenv";
import categoryModel from '../models/categoryModel';
import mongoose from 'mongoose';

dotenv.config();

  // Create categories
const foodCategory = new categoryModel({
  name: 'Food',
  slug: 'food-slug'
});

const clothingCategory = new categoryModel({
  name: 'Clothing',
  slug: 'clothing-slug'
});

const electronicsCategory = new categoryModel({
  name: 'Electronics',
  slug: 'electronics-slug'
});
// Create products
const bread = new productModel({
  name: 'Bread',
  slug: 'bread-slug',
  description: 'this is a loaf of gardenia',
  price: 3,
  category: foodCategory._id,
  quantity: 1
});

const jeans = new productModel({
  name: 'Jeans',
  slug: 'jeans-slug',
  description: 'this is light blue',
  price: 70,
  category: clothingCategory._id,
  quantity: 1
});

const shirt = new productModel({
  name: 'Shirt',
  slug: 'shirt-slug',
  description: 'there is a picture of bread on this shirt',
  price: 45,
  category: clothingCategory._id,
  quantity: 1
});

const ps5 = new productModel({
  name: 'PS5',
  slug: 'ps5-slug',
  description: 'this is the latest gaming console',
  price: 600,
  category: electronicsCategory._id,
  quantity: 1
});


describe('Integration Test: searchProductController', () => {
  let req, res;

  beforeEach(() => {
      res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
      }; // Simulate response object
      jest.clearAllMocks(); // Clear mocks before each test
  });

  beforeAll( async () => {
      await mongoose.connect(process.env.MONGO_URL);

      await foodCategory.save();
      await clothingCategory.save();
      await electronicsCategory.save();

      await bread.save();
      await jeans.save();
      await shirt.save();
      await ps5.save();
  });

  afterAll( async () => {
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});
    
    mongoose.disconnect();
  });

  it('should return products matching the search keyword', async () => {
    // Arrange: Simulate a valid request searching for 'bread'
    req = { params: { keyword: 'bread' } };

    // Act: Call the controller function
    await searchProductController(req, res);
  
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({
      name: 'Bread',
      slug: 'bread-slug',
      description: 'this is a loaf of gardenia',
      price: 3,
      category: foodCategory._id,
      quantity: 1
    }), expect.objectContaining({
      name: 'Shirt',
      slug: 'shirt-slug',
      description: 'there is a picture of bread on this shirt',
      price: 45,
      category: clothingCategory._id,
      quantity: 1
    })]));
  });

  it('should handle errors gracefully', async () => {
    // Arrange: Simulate an invalid request
    req = { params: {} };

    // Act: Call the controller function
    await searchProductController(req, res);

    // Assert: Check if the response contains the error message
    expect(res.status).toHaveBeenCalledWith(400); // Check if status 400 was called
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error In Search Product API',
      error: expect.any(Object), // Checking for an error object
    });
  });
});
