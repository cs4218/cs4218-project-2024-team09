import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import productModel from '../models/productModel';
import categoryModel from '../models/categoryModel';
import mongoose from 'mongoose';

dotenv.config();

test.beforeAll( async () => {
    await mongoose.connect(process.env.MONGO_URL);
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});

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

    await bread.save();
    await jeans.save();
    await shirt.save();
    await ps5.save();
});

/* 
Fails non-deterministically as each filter seems to work sometimes and not work at other times 
for unknown reasons. I have tried manually filtering on the site itself and I experience the
same non-deterministic behaviour of filters when doing so as well
*/
test('BUG: Filter products by price or/and category', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('link', { name: 'HOME' }).click();
    await expect(page).toHaveURL('http://localhost:3000');
    
    // Filter by price range $0 to $19
    await page.click('text="$0 to 19"');
    await expect(page.getByText('Bread')).toBeVisible();
    await expect(page.getByText('Jeans')).not.toBeVisible();
    await expect(page.getByText('Shirt')).not.toBeVisible();
    await expect(page.getByText('PS5')).not.toBeVisible();

    // Filter by price range $100 or more
    await page.click('text="$100 or more"');
    await expect(page.getByText('PS5')).toBeVisible();
    await expect(page.getByText('Bread')).not.toBeVisible();
    await expect(page.getByText('Jeans')).not.toBeVisible();
    await expect(page.getByText('Shirt')).not.toBeVisible();

    // Reset filters
    await page.click('button:has-text("RESET FILTERS")');
    await expect(page.getByText('Bread')).toBeVisible();
    await expect(page.getByText('Jeans')).toBeVisible();
    await expect(page.getByText('Shirt')).toBeVisible();
    await expect(page.getByText('PS5')).toBeVisible();

    // Filter by clothing category
    await page.getByLabel('Clothing').check();
    await expect(page.getByText('Jeans')).toBeVisible();
    await expect(page.getByText('Shirt')).toBeVisible();
    await expect(page.getByText('Bread')).not.toBeVisible();
    await expect(page.getByText('PS5')).not.toBeVisible();

    // Filter by clothing category and price range $40 to 59
    await page.click('text="$40 to 59"');
    await expect(page.getByText('Shirt')).toBeVisible();
    await expect(page.getByText('Bread')).not.toBeVisible();
    await expect(page.getByText('Jeans')).not.toBeVisible();
    await expect(page.getByText('PS5')).not.toBeVisible();
});

test.afterAll( async () => {
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});
    
    mongoose.disconnect();
});