import { spawn } from "child_process"
import axios from "axios"
import mongoose from "mongoose"
import "@testing-library/jest-dom"
import dotenv from "dotenv"
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import CartPage from "./CartPage"
import { AuthProvider } from "../context/auth"
import { CartProvider } from "../context/cart"
import { SearchProvider } from "../context/search"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { mockCategories, mockProducts, mockUsers } from "./Mock"
import jwt from "jsonwebtoken"
import ProductDetails from "./ProductDetails"
import productModel from "../../../models/productModel"
import categoryModel from "../../../models/categoryModel"
import Categories from "./Categories"
import CategoryProduct from "./CategoryProduct"

// import env
dotenv.config()

// DB settings
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL)
})


// Server settings
let server
beforeAll(async () => {
    server = await new Promise(async (res, rej) => {
        const temp = spawn('node', ["./server"])
        // temp.stdout.pipe(process.stdout)
        // temp.stderr.pipe(process.stderr)
        temp.on('error', rej)
        
        // wait for things to run
        const wait_time = 1800
        await new Promise((res) => setTimeout(res, wait_time))
        
        // extra time
        const timeout = 5500 // 5.5 second wait
        const max_time = Date.now() + timeout 
        // wait until server is reachable
        while (true) {
            try {
                await axios.get(process.env.REACT_APP_API)
                console.log(`${process.env.REACT_APP_API} reached in ${(Date.now() - max_time + timeout + wait_time)/1000}s`)
                return res(temp)
            } catch (err) {
                if (Date.now() > max_time) {
                    return rej(`${process.env.REACT_APP_API} not reachable in ${timeout/1000}s`)
                } else {
                    // wait 1.8s before trying again
                    await new Promise((res) => setTimeout(res, wait_time))
                }
            }
        }
    })
})

afterAll(async () => {
    if (server !== undefined) {
        server.kill()
        // wait for complete death
        await new Promise((res) => server.on('close', () => {
            return res()
        } ))
    }
    await mongoose.connection.close()
})

// setup localStorage
let store = {}
Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: (k, v) => store[k] = v,
        getItem: (k) => store[k],
        removeItem: (k) => delete store[k],
        clear: () => store = {} 
    },
    writable: true,
});

// reset localstorage after each
afterEach(() => {
    localStorage.clear()
})

describe("CartPage integration tests", () => {
    describe("Given authentication and a cart with items", () => {
        beforeEach(() => {
            const token = jwt.sign(mockUsers[0], process.env.JWT_SECRET)
            const auth = {
                user: mockUsers[0],
                token: token
            }
            localStorage.setItem("auth", JSON.stringify(auth));
    
        })
        describe("When the payment button is pressed", () => {
            beforeEach(() => {
                const cart = mockProducts
                localStorage.setItem("cart", JSON.stringify(cart));
            })
            
            // test fails as API calls are made to the wrong address (env REACT_APP_API is not used!)
            test.failing("Then checkout API call should succeed", async () => {
                render(<AuthProvider>
                            <SearchProvider>
                                <CartProvider>
                                    <MemoryRouter>
                                        <Routes>
                                            <Route path="/" element={<CartPage />} />
                                        </Routes>
                                    </MemoryRouter>
                                </CartProvider>
                            </SearchProvider>
                        </AuthProvider>)
                
                // find payment button (wait dropin api call)
                const payment_button = await screen.findByRole("button", {name: "Make Payment"})
                await waitFor(() => {
                    expect(payment_button).toBeInTheDocument()
                })

                // wait for dropin to load instance
                await waitFor(() => {
                    expect(payment_button).not.toBeDisabled()
                })
                
                // make payment
                fireEvent.click(payment_button)

                // expect toast sucess
                const toast = await screen.findByText("Payment Completed Successfully")
                expect(toast).toBeInTheDocument()
            })       
        })
    })    
})

describe("ProductDetails integration tests", () => {
    describe("Given an existing product", () => {
        let mockCategoryID, mockProductID
        let mockCat = mockCategories[0]
        let mockProd = mockProducts[0]
        beforeEach(async () => {
            delete mockCat._id
            mockCategoryID = await categoryModel.create(mockCat)
            mockCat._id = mockCategoryID
            delete mockProd._id
            mockProductID = await productModel.create({
                ...mockProd,
                category: mockCategoryID
            })
            mockProd._id = mockProductID
        })
        afterEach(async () => {
            await categoryModel.deleteOne({_id: mockCategoryID})
            await productModel.deleteOne({_id: mockProductID})
        })

        // test fails as API call is at the wrong address
        test.failing("Then product should be shown", async () => {
            const path = `/product/${mockProd.slug}`
            render(<AuthProvider>
                <SearchProvider>
                    <CartProvider>
                        <MemoryRouter initialEntries={[path]}>
                            <Routes>
                                <Route path="/product/:slug" element={<ProductDetails />} />
                            </Routes>
                        </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
            </AuthProvider>)
            
            // expect product to be here
            await expect(screen.findByText(new RegExp(mockProd.name, "i"))).resolves.toBeInTheDocument()
            await expect(screen.findByText(new RegExp(mockProd.price, "i"))).resolves.toBeInTheDocument()
        })
    })
    describe("Given two products in the same category", () => {
        let mockCategoryID, mockProduct1ID, mockProduct2ID
        let mockCat = mockCategories[0]
        let mockProd1 = mockProducts[0]
        let mockProd2 = mockProducts[1]
        beforeEach(async () => {
            delete mockCat._id
            mockCategoryID = await categoryModel.create(mockCat)
            mockCat._id = mockCategoryID
            delete mockProd1._id
            mockProduct1ID = await productModel.create({
                ...mockProd1,
                category: mockCategoryID
            })
            mockProd1._id = mockProduct1ID
            delete mockProd2._id
            mockProduct2ID = await productModel.create({
                ...mockProd2,
                category: mockCategoryID
            })
            mockProd2._id = mockProduct2ID
        })
        afterEach(async () => {
            await categoryModel.deleteOne({_id: mockCategoryID})
            await productModel.deleteOne({_id: mockProduct1ID})
            await productModel.deleteOne({_id: mockProduct2ID})
        })

        // test fails as API call is at the wrong address
        test.failing("Then the product should be shown", async () => {
            const path = `/product/${mockProd1.slug}`
            render(<AuthProvider>
                <SearchProvider>
                    <CartProvider>
                        <MemoryRouter initialEntries={[path]}>
                            <Routes>
                                <Route path="/product/:slug" element={<ProductDetails />} />
                            </Routes>
                        </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
            </AuthProvider>)
            
            // expect similar product 2 to be here
            await expect(screen.findByText(new RegExp(mockProd2.name, "i"))).resolves.toBeInTheDocument()
            await expect(screen.findByText(new RegExp(mockProd2.price, "i"))).resolves.toBeInTheDocument()
        })
    })
})

describe("Categories integration tests", () => {
    describe("Given two categories", () => {
        let mockCategory1ID, mockCategory2ID 
        let mockCat1 = mockCategories[0]
        let mockCat2 = mockCategories[1]
        beforeEach(async () => {
            delete mockCat1._id
            mockCategory1ID = await categoryModel.create(mockCat1)
            mockCat1._id = mockCategory1ID
            delete mockCat2._id
            mockCategory2ID = await categoryModel.create(mockCat2)
            mockCat2._id = mockCategory2ID
        })
        afterEach(async () => {
            await categoryModel.deleteOne({_id: mockCategory1ID})
            await categoryModel.deleteOne({_id: mockCategory2ID})
        })
        test.failing("Then both categories should be displayed", async () => {
            render(<AuthProvider>
                <SearchProvider>
                    <CartProvider>
                        <MemoryRouter initialEntries={["/categories"]}>
                            <Routes>
                                <Route path="/categories" element={<Categories />} />
                            </Routes>
                        </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
            </AuthProvider>)

            // find the two categories
            await expect(screen.findByText(new RegExp(mockCat2.name, "i"))).resolves.toBeInTheDocument()
            await expect(screen.findByText(new RegExp(mockCat2.price, "i"))).resolves.toBeInTheDocument()
        })
    })
})

describe("CategoryProduct integration tests", () => {
    describe("Given a category with products", () => {
        let mockCategoryID, mockProduct1ID, mockProduct2ID
        let mockCat = mockCategories[0]
        let mockProd1 = mockProducts[0]
        let mockProd2 = mockProducts[1]
        beforeEach(async () => {
            delete mockCat._id
            mockCategoryID = await categoryModel.create(mockCat)
            mockCat._id = mockCategoryID
            delete mockProd1._id
            mockProduct1ID = await productModel.create({
                ...mockProd1,
                category: mockCategoryID
            })
            mockProd1._id = mockProduct1ID
            delete mockProd2._id
            mockProduct2ID = await productModel.create({
                ...mockProd2,
                category: mockCategoryID
            })
            mockProd2._id = mockProduct2ID
        })
        afterEach(async () => {
            await categoryModel.deleteOne({_id: mockCategoryID})
            await productModel.deleteOne({_id: mockProduct1ID})
            await productModel.deleteOne({_id: mockProduct2ID})
        })
        test.failing("Then the products of the category should be shown", async () => {
            const path = `/category/${mockCat.slug}`
            render(<AuthProvider>
                <SearchProvider>
                    <CartProvider>
                        <MemoryRouter initialEntries={[path]}>
                            <Routes>
                                <Route path="/category/:slug" element={<CategoryProduct />} />
                            </Routes>
                        </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
            </AuthProvider>)
            
            // expect similar product 1 and 2 to be here
            await expect(screen.findByText(new RegExp(mockProd1.name, "i"))).resolves.toBeInTheDocument()
            await expect(screen.findByText(new RegExp(mockProd1.price, "i"))).resolves.toBeInTheDocument()
            await expect(screen.findByText(new RegExp(mockProd2.name, "i"))).resolves.toBeInTheDocument()
            await expect(screen.findByText(new RegExp(mockProd2.price, "i"))).resolves.toBeInTheDocument()
    
        })
    })
})