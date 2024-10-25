import productModel from '../models/productModel';
import { productFiltersController } from './productController';
import dotenv from "dotenv";
import categoryModel from '../models/categoryModel';
import mongoose from 'mongoose';

dotenv.config();

// Create categories
const foodCategory = new categoryModel({
    name: 'Food',
    slug: 'food-slug',
    });

    const clothingCategory = new categoryModel({
    name: 'Clothing',
    slug: 'clothing-slug',
    });

    // Create products
    const bread = new productModel({
    name: 'Bread',
    slug: 'bread-slug',
    description: 'this is a loaf of gardenia',
    price: 3,
    category: foodCategory._id,
    quantity: 1,
    });

    const jeans = new productModel({
    name: 'Jeans',
    slug: 'jeans-slug',
    description: 'this is light blue',
    price: 70,
    category: clothingCategory._id,
    quantity: 1,
    });

    const shirt = new productModel({
    name: 'Shirt',
    slug: 'shirt-slug',
    description: 'this is green',
    price: 45,
    category: clothingCategory._id,
    quantity: 1,
    });

describe('Integration Test: productFiltersController', () => {
  let req, res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);

    await foodCategory.save();
    await clothingCategory.save();

    await bread.save();
    await jeans.save();
    await shirt.save();
  });

  afterAll(async () => {
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});
    mongoose.disconnect();
  });

  it('should return only products matching the filters', async () => {
    // Arrange: Simulate a request
    req = { body: {
      checked: [clothingCategory._id],
      radio: [ 60, 79 ]
    }};

    // Act: Call the controller function
    await productFiltersController(req, res);

    // Assert: Check if the response contains the expected data
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: expect.arrayContaining([expect.objectContaining({
        name: 'Jeans',
        slug: 'jeans-slug',
        description: 'this is light blue',
        price: 70,
        category: clothingCategory._id,
        quantity: 1,
      })]),
    });

    // Check if the response excludes the non-matching products
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: expect.not.arrayContaining([
        expect.objectContaining({
          name: 'Bread',
          slug: 'bread-slug',
          description: 'this is a loaf of gardenia',
          price: 3,
          category: foodCategory._id,
          quantity: 1
        }), expect.objectContaining({
          name: 'Shirt',
          slug: 'shirt-slug',
          description: 'this is green',
          price: 45,
          category: clothingCategory._id,
          quantity: 1
        }),
      ]),
    });
  });

  it('should return an empty array when no products match the filters', async () => {
    // Arrange: Simulate a request
    req = { body: { 
      checked: [], 
      radio: [ 20, 39 ] // Price range that doesn't match any product
    }};

    // Act: Call the controller function
    await productFiltersController(req, res);

    // Assert: Check if the response contains an empty products array
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: [],
    });
  });

  it('should handle errors gracefully', async () => {
    // Arrange: Simulate an invalid request
    req = { body: { 
      checked: [], 
      radio: ["expensive"] 
    }};

    // Act: Call the controller function
    await productFiltersController(req, res);

    // Assert: Check if the response contains the error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error WHile Filtering Products',
      error: expect.any(Object),
    });
  });
});
