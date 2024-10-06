import React from "react"
import { useParams } from "react-router-dom";
import {screen, render, waitFor} from "@testing-library/react"
import ProductDetails from "./ProductDetails";
import axios from "axios";
import "@testing-library/jest-dom"
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
        useParams.mockReturnValue({slug: "123"})
        jest.spyOn(axios, "get").mockRejectedValue(new Error("product not found"))
    })
    

    test.failing("Then error is logged and no product should be displayed", async () => {
        // mocked to reduce loging output when running suits
        // remove mockImplementation to debug!
        const spy = jest.spyOn(console, "log").mockImplementation((a) => a)
        render(<ProductDetails/>)
        
        await waitFor(() => {
            expect(spy).toHaveBeenCalled()
        })
        const add_button = screen.queryByRole("button")
        expect(add_button).not.toBeInTheDocument()
    })
})

describe("Given good params", () => {
    beforeEach(() => {
        useParams.mockReturnValue({slug: "123"})
    })
    
    describe("When product has no relatives", () => {
        beforeEach(() => {
            jest.spyOn(axios, "get")
                .mockResolvedValueOnce({data: {
                    product: mockProducts[0]}})
                .mockResolvedValueOnce({data: {
                    products: []}})
        })
        test("Then only the product should be shown", async () => {
            render(<ProductDetails/>)
            
            await waitFor(() => {
                expect(axios.get).toHaveReturnedTimes(2)
            })

            const add_button = screen.queryByRole("button", {name: "ADD TO CART"})
            expect(add_button).toBeInTheDocument()
            const details_button = screen.queryByRole("button", {name: "More Details"})
            expect(details_button).not.toBeInTheDocument()
        })
    })
    describe("When product has relatives", () => {
        beforeEach(() => {
            jest.spyOn(axios, "get")
                .mockResolvedValueOnce({data: {
                    product: mockProducts[0]}})
                .mockResolvedValueOnce({data: {
                    products: mockProducts}})
        })
        test("Then product and relatives should be shown", async () => {
            render(<ProductDetails/>)
            
            await waitFor(() => {
                expect(axios.get).toHaveReturnedTimes(2)
            })

            const add_button = screen.getByRole("button", {name: "ADD TO CART"})
            expect(add_button).toBeInTheDocument()
            const details_button = await screen.findAllByRole("button", {name: "More Details"})
            expect(details_button).toHaveLength(mockProducts.length)
        })
    })
})