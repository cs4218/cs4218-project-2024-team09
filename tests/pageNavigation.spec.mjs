import { test, expect } from '@playwright/test';

// User should be able to navigate to the various pages by clicking the respective links
test('Navigate between Home, About, Contact and Privacy Policy pages', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Go to "About" page
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('http://localhost:3000/about');
    await page.isVisible('img[alt="contactus"]');

    // Go to "Contact" page
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL('http://localhost:3000/contact');
    await expect(page.getByText('CONTACT US')).toBeVisible();

    // Go to "Privacy Policy Page"
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL('http://localhost:3000/policy');
    await expect(page.locator('text=add privacy policy').first()).toBeVisible();

    // Go back to Home page
    await page.getByRole('link', { name: 'HOME' }).click();
    await expect(page).toHaveURL('http://localhost:3000');
    const pageTitle = await page.title();
    await expect(pageTitle).toContain('ALL Products - Best offers');

    // Go to "Login" page

    // Go to "Register" page

});