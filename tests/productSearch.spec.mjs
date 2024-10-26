import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import productModel from '../models/productModel';
import categoryModel from '../models/categoryModel';
import mongoose from 'mongoose';

dotenv.config();

test.beforeAll( async () => {
    await mongoose.connect(process.env.MONGO_URL);

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

    await foodCategory.save();
    await clothingCategory.save();
    await electronicsCategory.save();

    // Create products
    const bread1 = new productModel({
        name: 'White Bread',
        slug: 'whitebread-slug',
        description: '1 loaf',
        price: 3,
        category: foodCategory._id,
        quantity: 1
    });

    const bread2 = new productModel({
        name: 'Wholemeal Bread',
        slug: 'wholemealbread-slug',
        description: 'this is also 1 loaf',
        price: 70,
        category: foodCategory._id,
        quantity: 1
    });

    const shirt = new productModel({
        name: 'Shirt',
        slug: 'shirt-slug',
        description: 'this is green',
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

    await bread1.save();
    await bread2.save();
    await shirt.save();
    await ps5.save();
});

test.beforeEach( async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('link', { name: 'HOME' }).click();
    await expect(page).toHaveURL('http://localhost:3000');
});

test('search for product', async ({ page }) => {
    // Searching for "bread" should return 2 results
    await page.getByPlaceholder('Search').fill('bread');
    await page.click('button:has-text("Search")');
    await expect(page).toHaveURL('http://localhost:3000/search');
    var pageTitle = await page.title();
    await expect(pageTitle).toContain('Search results');
    await expect(page.getByText('White Bread')).toBeVisible();
    await expect(page.getByText('Wholemeal Bread')).toBeVisible();
    await expect(page.getByText('Shirt')).not.toBeVisible();
    await expect(page.getByText('PS5')).not.toBeVisible();

    // Searching for "shirt" should return 1 result
    await page.getByPlaceholder('Search').fill('shirt');
    await page.click('button:has-text("Search")');
    await expect(page).toHaveURL('http://localhost:3000/search');
    pageTitle = await page.title();
    await expect(pageTitle).toContain('Search results');
    await expect(page.getByText('Shirt')).toBeVisible();
    await expect(page.getByText('White Bread')).not.toBeVisible();
    await expect(page.getByText('Wholemeal Bread')).not.toBeVisible();
    await expect(page.getByText('PS5')).not.toBeVisible();

    // Searching for "jeans" should not return any results
    await page.getByPlaceholder('Search').fill('jeans');
    await page.click('button:has-text("Search")');
    await expect(page).toHaveURL('http://localhost:3000/search');
    pageTitle = await page.title();
    await expect(pageTitle).toContain('Search results');
    await expect(page.getByText('No Products Found')).toBeVisible();
});

test.afterAll( async () => { 
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});

    mongoose.disconnect();
});