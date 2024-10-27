import { test, expect, defineConfig } from '@playwright/test';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import userModel from '../models/userModel';
import productModel from '../models/productModel';
import categoryModel from '../models/categoryModel';
import { hashPassword } from '../helpers/authHelper';

dotenv.config()
defineConfig({
    use: {
        MONGO_URL: process.env.MONGO_URL
    }
})

const mockCat1 = {
    name: "Real",
    slug: "real"
}

const mockProd1 = {
    name: "Thing",
    slug: "1",
    description: "Thing's item",
    price: 1,
    quantity: 1,
}

const mockCat2 = {
    name: "Fake",
    slug: "fake"
}

const mockProd2 = {
    name: "Thing2",
    slug: "6",
    description: "Thing2's item",
    price: 2,
    quantity: 2,
}


test.describe("Cart Workflow UI Test", () => {
    // ensure that there are at least some products and categories
    let cat1ID, cat2ID, prod1ID, prod2ID, userID
    test.beforeEach(async () => {
        await mongoose.connect("process.env.MONGO_URL")
        cat1ID = await categoryModel.create(mockCat1)
        cat2ID = await categoryModel.create(mockCat2)
        prod1ID = await productModel.create({...mockProd1, category: cat1ID})
        prod2ID = await productModel.create({...mockProd2, category: cat1ID})
        const password = await hashPassword("123456789")
        userID = await userModel.create({ 
            name: "test", 
            email: "magic@magic.com", 
            phone: "123", 
            address: "A", 
            answer: "A", 
            password: password
        })
    })

    // close connection
    test.afterEach(async () => {
        await productModel.deleteOne({_id: prod1ID})
        await productModel.deleteOne({_id: prod2ID})
        await categoryModel.deleteOne({_id: cat1ID})
        await categoryModel.deleteOne({_id: cat2ID})
        await userModel.deleteOne({_id: userID})
        await mongoose.connection.close()
    })

    // User goes to category and adds items to cart and sees it in cart page
    // fails as add to cart is borken on product details
    test.fail("User is able to add and remove items from cart", async ({page}) => {
        await page.goto('http://localhost:6060/')
        await page.getByRole("link", {name: "Categories"}).click()
        await page.getByRole("link", {name: "All Categories"}).click()
        await page.getByRole("link", {name: "Real"}).click()
        await page.getByRole("button", {name: "More Details"}).click()
        const name = await page.getByText(new RegExp("Name :*", "i")).textContent()
        await page.getByRole("button", {name:  "ADD TO CART"}).click()
        // go cart
        await page.getByRole("link", {name: "cart"}).click()
        const remove_button = page.getByRole("button", {name: "remove"})
        await expect(remove_button).toBeAttached()
        await expect(page.getByRole("main")).toHaveText(new RegExp(name.replace("Name :", ""), "i"))
        // remove cart
        await remove_button.click()
        await expect(page.getByRole("main")).not.toHaveText(new RegExp(name.replace("Name :", ""), "i"))
        await expect(remove_button).not.toBeAttached()
    })


    // Adds items, goes to cart, logs in and then pays
    // fails frontend calls the wrong api
    test.fail("User is logins and is able to pay", async ({page}) => {
        await page.goto('http://localhost:6060/')
        await page.getByRole("button", {name: "ADD TO CART"}).click()
        // go cart
        await page.getByRole("link", {name: "cart"}).click()
        // login
        await page.getByRole("button", {name: "Plase Login to checkout"}).click()
        await page.getByPlaceholder('Enter Your Email ').fill('magic@magic.com');
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill('123456789');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        // go cart
        await page.getByRole("link", {name: "cart"}).click()
        // make payment
        const payment_button = page.getByRole("button", {name: "Make Payment"})
        await expect(payment_button).toBeAttached()
        await expect(payment_button).not.toBeDisabled()
        await payment_button.click()
    })

    // User is able to browse items without adding to cart
    // product detail page is broken
    test.fail("User is able to browse by category without adding to cart", async ({page}) => {
        await page.goto('http://localhost:6060/')
        await page.getByRole("link", {name: "Categories"}).click()
        await page.getByRole("link", {name: "Real"}).click()
        await page.getByRole("button", {name: "More Details"}).click()
        expect(page.getByRole("main")).toHaveText(new RegExp(mockProd1.name, "i"))
        await page.getByRole("link", {name: "Categories"}).click()
        await page.getByRole("link", {name: "Fake"}).click()
        expect(page.getByRole("button", {name: "More Details"})).not.toBeAttached()
    })


})

