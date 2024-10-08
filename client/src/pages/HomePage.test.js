import React from "react";
import HomePage from "./HomePage";
import * as Cart from "../context/cart"
import axios from "axios";
import {screen, render, waitFor, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockCategories, mockProducts } from "./Mock";
import toast from "react-hot-toast";

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

jest.mock("react-router-dom", () => {
    const navigate = jest.fn()
    return {
        useNavigate: navigate
    }
})

jest.spyOn(Cart, "useCart").mockImplementation(() => {
    const setCart = jest.fn((a) => [a])
    return [[], setCart]
})

jest.mock("./../components/Layout", () => {
    return ({children}) => <>{children}</>
})

afterEach(() => {
    jest.clearAllMocks()
})

describe("Given no products and no categories", () => {
    beforeEach(() => {
        jest.spyOn(axios, "get").mockResolvedValue({data: {
            products: [],
            category: [],
            success: true,
            total: 0
        }})
        jest.spyOn(axios, "post").mockResolvedValue({data: {
            products: [],
            category: [],
            success: true,
            total: 0
        }})
    })
    describe("When no filters are applied", () => {
        test("Then there should be no products and no category filters", async () => {
            render(<HomePage/>)
            await waitFor(() => {
                expect(axios.get).toHaveReturned()
            })
            const checkboxes = screen.queryAllByRole("checkbox")
            const product_buttons = screen.queryAllByRole("button", {name: "ADD TO CART"})

            expect(checkboxes).toHaveLength(0)
            // should only have banner image
            expect(product_buttons).toHaveLength(0)
        })
    })
})

describe("Given one page of products and some categories", () => {
    beforeEach(() => {
        jest.spyOn(axios, "get").mockResolvedValue({data: {
            products: mockProducts,
            category: mockCategories,
            success: true,
            total: 2
        }})
        jest.spyOn(axios, "post").mockResolvedValue({data: {
            products: [mockProducts[1]],
            category: [mockCategories[1]],
            success: true,
            total: 1
        }})
    })
    describe("When no filters are applied", () => {
        test("Then the full page of products is shown", async () => {
            render(<HomePage/>)
            const product_buttons = await screen.findAllByRole("button", {name: "ADD TO CART"})
            const load_button = screen.queryByRole("button", {"name": "Loadmore"})
            expect(product_buttons).toHaveLength(mockProducts.length)
            expect(load_button).not.toBeInTheDocument()
        })
        describe("and add to cart button is presed", () => {
            test("Then the product is added to cart", async () => {
                const toastSpy = jest.spyOn(toast, "success")
                render(<HomePage/>)
                const product_buttons = await screen.findAllByRole("button", {name: "ADD TO CART"})
                fireEvent.click(product_buttons[0])
                await waitFor(() => {
                    expect(toastSpy).toHaveBeenCalled()
                })
                expect(localStorage.setItem).toHaveBeenCalled()
            })
        })
    })
    describe("When price filters are applied", () => {
        test.failing("Then the full price filtered set of products is shown", async () => {
            render(<HomePage/>)
            const radio_button = screen.getByRole("radio", {name: "$0 to 19"})
            fireEvent.click(radio_button)
            await waitFor(() => {
                expect(axios.post).toHaveReturned()
            })
            const product_buttons = await screen.findAllByRole("button", {name: "ADD TO CART"})
            const load_button = screen.queryByRole("button", {"name": "Loadmore"})
            expect(product_buttons).toHaveLength(1)
            expect(load_button).not.toBeInTheDocument()
        })
    })
    describe('When category filters are applied', () => {
        test.failing("Then a category filtered set of products is shown", async () => {
            render(<HomePage/>)
            const checkboxes = await screen.findAllByRole("checkbox")
            expect(checkboxes).toHaveLength(2)

            fireEvent.click(checkboxes[0])
            await waitFor(() => {
                expect(axios.post).toHaveReturned()
            })
            const product_buttons = await screen.findAllByRole("button", {name: "ADD TO CART"})
            const load_button = screen.queryByRole("button", {name: "Loadmore"})
            expect(load_button).not.toBeInTheDocument()
            expect(product_buttons).toHaveLength(1)
        })
    });
})

describe("Given two pages of products and some categories", () => {
    beforeEach(() => {
        jest.spyOn(axios, "get").mockImplementation((a) => {
            
            const one = {data: {
                products: [mockProducts[0]],
                category: mockCategories,
                success: true,
                total: 2
            }}
            const two = {data: {
                products: [mockProducts[1]],
                category: mockCategories,
                success: true,
                total: 2
            }}
            if (a.endsWith("2")) {
                return Promise.resolve(two)
            } else {
                return Promise.resolve(one)
            }
        })
        jest.spyOn(axios, "post").mockResolvedValue({data: {
            products: [mockProducts[1]],
            category: [mockCategories[1]],
            success: true,
            total: 1
        }})
    })
    describe("When Load more is pressed", () => {
        describe("and no filters are applied", () => {
            test("Then page 2 of products is shown", async () => {
                render(<HomePage/>)
                await waitFor(() => {
                    expect(axios.get).toHaveReturned()
                })
                const load_button = await screen.findByRole("button", {name: "Loadmore"})
                fireEvent.click(load_button)
                await waitFor(() => {
                    expect(screen.queryByText("Loading ...")).not.toBeInTheDocument()
                })
                const product_buttons = await screen.findAllByRole("button", {name: "ADD TO CART"})
                expect(product_buttons).toHaveLength(2)
                expect(load_button).not.toBeInTheDocument()
            })
        })
        describe("and category filters and price filters are applied", () => {
            test.failing("Then a full filtered set is shown", async () => {
                render(<HomePage/>)
                await waitFor(() => {
                    expect(axios.get).toHaveReturned()
                })
                const load_button = await screen.findByRole("button", {name: "Loadmore"})
                fireEvent.click(load_button)
                await waitFor(() => {
                    expect(screen.queryByText("Loading ...")).not.toBeInTheDocument()
                })
                const product_buttons = await screen.findAllByRole("button", {name: "ADD TO CART"})
                expect(product_buttons).toHaveLength(2)
                expect(load_button).not.toBeInTheDocument()

                const checkboxes = await screen.findAllByRole("checkbox")
                fireEvent.click(checkboxes[0])
                const radio_button = screen.getByRole("radio", {name: "$0 to 19"})
                fireEvent.click(radio_button)
                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalled()
                })
                expect(load_button).not.toBeInTheDocument()
                expect(product_buttons).toHaveLength(1)
            })
        })
    })
})