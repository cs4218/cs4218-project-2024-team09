import React from "react";
import CategoryProduct from "./CategoryProduct";
import {render, screen, waitFor} from "@testing-library/react"
import { useParams } from "react-router-dom";
import axios from "axios";
import { mockProducts } from "./Mock";

jest.mock("./../components/Layout", () => {
    return ({children}) => <>{children}</>
})
Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
});

jest.mock("react-router-dom", () => {
    const navigate = jest.fn().mockImplementation((n) => n)
    const params = jest.fn().mockReturnValue()
    return {
        useNavigate: () => {
            return navigate
        },
        useParams: params
    }
})


afterEach(() => {
    jest.resetAllMocks()
})

describe("Given bad params", () => {
    beforeEach(() => {
        jest.spyOn(axios, "get").mockRejectedValue(new Error("no product found"))
        useParams.mockReturnValue({slug: "abc"})
    })
    test("Then an error message is logged with no products", async () => {
        const logger = jest.spyOn(console, "log").mockImplementation((a) => a)
        render(<CategoryProduct/>)
        
        const productButtons = screen.queryAllByRole("button")
        await waitFor(() => {
            expect(logger).toHaveBeenCalled()
        })
        expect(productButtons).toHaveLength(0)
    })
})

describe("Given no params", () => {
    beforeEach(() => {
        jest.spyOn(axios, "get").mockRejectedValue(new Error("no product found"))
        useParams.mockReturnValue()
    })
    test("Then no error message and no products", async () => {
        const logger = jest.spyOn(console, "log").mockImplementation((a) => a)
        render(<CategoryProduct/>)
        
        const productButtons = screen.queryAllByRole("button")
        await waitFor(() => {
            expect(logger).not.toHaveBeenCalled()
        })
        expect(productButtons).toHaveLength(0)
        
    })
})

describe("Given good params", () => {
    beforeEach(() => {
        jest.spyOn(axios, "get").mockResolvedValue({data: {
            products: mockProducts,
            category: {name: "Real Items"}
        }
        })
        useParams.mockReturnValue({slug: "abc"})
    })
    test("Then no error message and some products", async () => {
        const logger = jest.spyOn(console, "log").mockImplementation((a) => a)
        render(<CategoryProduct/>)
        
        const productButtons = await screen.findAllByRole("button")
        expect(logger).not.toHaveBeenCalled()
        expect(productButtons).toHaveLength(mockProducts.length)
    })
})