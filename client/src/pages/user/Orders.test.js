import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'
import Orders from './Orders';
import * as Auth from '../../context/auth'
import axios from 'axios';
import { mockOrders } from '../Mock';
import "@testing-library/jest-dom";

// we will mock other components that do not interact with this page
// Dashboard.test.js only uses useAuth directly

jest.mock('../../components/UserMenu', () => {
    return () => <></>
})

jest.mock('../../components/Layout', () => {
    return ({children}) => <>{children}</>
})



beforeEach(() => {
    jest.clearAllMocks()
})
describe("Given auth exists", () => {
    beforeEach(() => {
        jest.spyOn(Auth, "useAuth").mockReturnValue([{token: true}])
    })
    describe("and API succeeds", () => {
        describe("and user has orders", () => {
            test("Then page should have products", async () => {
                const spy = jest.spyOn(axios, "get")
                spy.mockResolvedValue({data: mockOrders})
                
                render(<Orders />)
                const order_details = await screen.findByRole("table")
                const product_imgs = await screen.findAllByRole("img")
                
                expect(spy).toHaveBeenCalled()
                expect(order_details).toBeInTheDocument()
                expect(product_imgs).toHaveLength(mockOrders[0].products.length)
            })
        })
        describe("and has no orders", () => {
            test("Then page should have no products", async () => {
                const spy = jest.spyOn(axios, "get")
                spy.mockResolvedValue({data: []})
                
                render(<Orders />)
                await waitFor(() => {
                    expect(spy).toHaveReturned()
                })
                
                const order_details = screen.queryByRole("table")
                const product_imgs = screen.queryAllByRole("img")
                expect(order_details).not.toBeInTheDocument()
                expect(product_imgs).toHaveLength(0)
            })
        })
    })
    describe("and API fails", () => {
        test("Then error is logged and page should have no products", async () => {
            const spy = jest.spyOn(axios, "get")
            spy.mockRejectedValue(new Error("Not Found!"))
            const logger = jest.spyOn(console, "log")    
            
            render(<Orders />)
            await waitFor(() => {
                expect(logger).toHaveBeenCalled()
            })    
            const order_details = screen.queryByRole("table")
            const product_imgs = screen.queryAllByRole("img")
            expect(order_details).not.toBeInTheDocument()
            expect(product_imgs).toHaveLength(0)
        })
    })
})