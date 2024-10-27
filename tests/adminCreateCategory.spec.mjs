import { test, expect } from "@playwright/test";

test.describe('Admin create/delete/edit category', () => {
    const randomNum = Math.floor(Math.random() * 1000);
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/login");
        await page.getByPlaceholder("Enter Your Email ").fill("admin@gmail.com");
        await page.getByPlaceholder("Enter Your Password").click();
        await page.getByPlaceholder("Enter Your Password").fill("admin123");
        await page.getByRole("button", { name: "LOGIN" }).click();
      
        await page.waitForURL("http://localhost:3000");
        await page.getByRole("button", { name: "Admin" }).click();
        await page.getByRole("link", { name: "Dashboard" }).click();
        await expect(page.getByRole('link', { name: 'Create Category' })).toBeVisible();
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.waitForURL("http://localhost:3000/dashboard/admin/create-category");

        await page.fill('input[placeholder="Enter new category"]', `Testing category ${randomNum}`);
        await page.getByRole("button", { name: "Submit" }).click();

        await expect(page.getByRole('cell', { name: ` ${randomNum}` })).toBeVisible();
    });

    test("Admin creates a new category", async ({ page }) => {        
        await page.fill('input[placeholder="Enter new category"]', 'Testing creating category');
        await page.getByRole("button", { name: "Submit" }).click();

        await expect(page.getByRole('cell', { name: 'Testing creating category' })).toBeVisible();
        await page.getByRole('row').filter({hasText: 'Testing creating category'}).getByRole('button', { name: "Delete"}).click();
    });

    test("Admin delete a category", async ({ page }) => {
        const categoryToDelete = `Testing category ${randomNum}`;
        await expect(page.getByRole('cell', { name: categoryToDelete })).toBeVisible();

        await page.getByRole('row').filter({hasText: categoryToDelete}).getByRole('button', { name: "Delete"}).click();

        await expect(page.getByRole('cell', { name: categoryToDelete })).not.toBeVisible();
    });
})
