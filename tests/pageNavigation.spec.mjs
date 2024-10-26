import { test, expect } from '@playwright/test';

const mockProducts = [
    {
        name: 'Lego',
        description: 'This is a medium set',
        slug: 'lego-slug',
        price: 80,
        category: 'Toys'
    },
    {
        name: 'Shirt',
        description: 'This is green',
        slug: 'shirt-slug',
        price: 45,
        category: 'Clothing'
    },
    {
        name: 'Pen',
        description: 'This has blue ink',
        slug: 'pen-slug',
        price: 1.50,
        category: 'Stationery'
    }
];
const mockCategories = [
    {
        name: 'Toys',
        slug: 'toys-slug'
    },
    {
        name: 'Clothing',
        slug: 'clothing-slug'
    },
    {
        name: 'Stationery',
        slug: 'stationery-slug'
    }
];
test.beforeEach(async ({ page }) => {
    // Intercept API calls and return mock data
    await page.route('**/api/v1/category/get-category', async route => {
        route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ success: true, category: mockCategories }),
        });
    });

    await page.route('**/api/v1/product/product-list/1', async route => {
        route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ products: mockProducts }),
        });
    });

    await page.route('**/api/v1/product/product-count', async route => {
        route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ total: mockProducts.length }),
        });
    });

    await page.goto('http://localhost:3000');
});

// User should be able to navigate to the various pages by clicking the respective links
test('Navigate between Home, About, Contact and Privacy Policy pages', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Go to 'About' page
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('http://localhost:3000/about');
    await page.isVisible("img[alt='contactus']");

    // Go to 'Contact' page
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL('http://localhost:3000/contact');
    await expect(page.getByText('CONTACT US')).toBeVisible();

    // Go to 'Privacy Policy' page
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL('http://localhost:3000/policy');
    await expect(page.locator('text=add privacy policy').first()).toBeVisible();

    // Go back to Home page
    await page.getByRole('link', { name: 'HOME' }).click();
    await expect(page).toHaveURL('http://localhost:3000');
    const pageTitle = await page.title();
    await expect(pageTitle).toContain('ALL Products - Best offers');

    // Check if all products are displayed on the home page
    for (const pdt of mockProducts) {
        await expect(page.getByText(pdt.name)).toBeVisible();
    }
    // Check if all category filters are displayed on home page
    for (const category of mockCategories) {
        const checkbox = page.getByRole('checkbox', { name: category.name });
        await expect(checkbox).toBeVisible();
    }
});