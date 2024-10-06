import React from "react"
import axios from "axios"
import toast from "react-hot-toast"
import DropIn from "braintree-web-drop-in-react"
import { fireEvent, logRoles, render, screen, waitFor } from '@testing-library/react'
import * as Auth from "../context/auth"
import * as Cart from "../context/cart"
import CartPage from "./CartPage"
import { useNavigate } from "react-router-dom"
import '@testing-library/jest-dom'
import { mockProducts, mockUsers } from "./Mock"



jest.mock("./../components/Layout", () => {
    return ({children}) => <>{children}</>
})


jest.mock("react-router-dom", () => {
    const navigate = jest.fn().mockImplementation((n) => n)
    return {
        useNavigate: () => {
            return navigate
        }
    }
})
    
    
Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});
 

jest.mock("braintree-web-drop-in-react", () => {
    const MockDropIn = jest.fn(({options, onInstance}) => {
        const {useEffect} = jest.requireActual("react")

        useEffect(() => {
            onInstance({ 
                requestPaymentMethod: () => {return {nonce: true}}
            })
        }, [])
        return <></>
    })
    return MockDropIn
})
    
afterEach(() => {
    jest.resetAllMocks()
})
describe("Given valid authentication", () => {
    beforeEach(() => {
        jest.spyOn(Auth, "useAuth").mockReturnValue([{
            user: mockUsers[0],
            token: true
        }, jest.fn()])
        jest.spyOn(axios, "post").mockResolvedValue({data: true})
    })
    describe("And empty cart with valid client token and instance", () => {
        beforeEach(() => {
            const setCart = jest.fn((x) => x)
            jest.spyOn(Cart, "useCart").mockReturnValue([
                [], 
                setCart])
            jest.spyOn(axios, "get").mockImplementation(
                () => {
                    return Promise.resolve({data: {clientToken: true}})
                }
            )
            DropIn.mockImplementation(jest.fn(({options, onInstance}) => {
                const {useEffect} = jest.requireActual("react")
        
                useEffect(() => {
                    onInstance({ 
                        requestPaymentMethod: () => {return {nonce: true}}
                    })
                }, [])
                return <></>
            }))
        })
        
        test("Then payment button should not exist", async () => {
            render(<CartPage />)
            const payment_button = screen.queryByRole("button", {name: "Make Payment"})
            await waitFor(() => {
                expect(payment_button).not.toBeInTheDocument()
            })
        })

    })

    describe("And a cart with items", () => {
        beforeEach(() => {
            let mockCart = mockProducts.slice()
            const mockSetCart = jest.fn((x) => {
                while(mockCart.length > 0) {
                    mockCart.pop()
                }
                while(mockCart.length !== x.length) {
                    mockCart.push(x[mockCart.length])
                }
                return mockCart
            })
            jest.spyOn(Cart, "useCart").mockImplementation(() => {
                return [mockCart, mockSetCart]})
        })
        describe("And no client Token and no instance", () => {
            beforeEach(() => {
                jest.spyOn(axios, "get").mockImplementation(
                    () => {
                        return Promise.resolve({data: {clientToken: false}})
                    }
                )
                DropIn.mockReturnValue((<></>))
            })
            test("Then payment button should not exist", async () => {
            
                render(<CartPage />)
                const payment_button = screen.queryByRole("button", {name: "Make Payment"})
                await waitFor(() => {
                    expect(payment_button).not.toBeInTheDocument()
                })
            })
        })
        describe("And with valid client token and instance", () => {
            beforeEach(() => {
                jest.spyOn(axios, "get").mockImplementation(
                    () => {
                        return Promise.resolve({data: {clientToken: true}})
                    }
                )
                DropIn.mockImplementation(jest.fn(({options, onInstance}) => {
                    const {useEffect} = jest.requireActual("react")
            
                    useEffect(() => {
                        onInstance({ 
                            requestPaymentMethod: () => {return {nonce: true}}
                        })
                    }, [])
                    return <></>
                }))
            })

            describe('When remove is pressed on product1', () => {
                test('Then cart should have only product2 and button is not disabled', async () => {
                    render(<CartPage />)
                    const payment_button = await screen.findByRole("button", {name: "Make Payment"})
                    const remove_buttons = screen.getAllByRole("button", {name: "Remove"})
                    fireEvent.click(remove_buttons[0])
                    
                    const [mockCart, mockSetCart] = Cart.useCart()
                    
                    await waitFor(() => {
                        expect(mockSetCart).toHaveBeenCalledWith([mockProducts[1]])
                    })
                    await waitFor(() => {
                        expect(DropIn).toHaveReturnedTimes(2)
                    })
                    expect(localStorage.setItem).toHaveBeenCalledWith("cart", JSON.stringify([mockProducts[1]]))
                    expect(mockCart).toHaveLength(1)
                    expect(payment_button).not.toBeDisabled()
                });
            });

            describe('When remove is pressed on both products', () => {
                test('The cart should have no more products and payment button is disabled', async () => {
                    const {rerender} = render(<CartPage />)
                    const remove_buttons = screen.getAllByRole("button", {name: "Remove"})
                    fireEvent.click(remove_buttons[0])
                    fireEvent.click(remove_buttons[1])
                    
                    const [mockCart, mockSetCart] = Cart.useCart()
                    
                    await waitFor(() => {
                        expect(mockSetCart).toHaveBeenCalledWith([])
                    })
                    expect(localStorage.setItem).toHaveBeenCalledWith("cart", "[]")
                    expect(mockCart).toHaveLength(0)
                    
                    // rerender cart page as we have updated cart to be zero, by default, useContext should cause update
                    // but i can't do provider changes as provider files are bugged
                    rerender(<CartPage />)
                    await waitFor(() => {
                        expect(screen.queryByRole("button", {name: "Make Payment"})).not.toBeInTheDocument()
                    })
                });
            })
            describe('When payment button is pressed', () => {
                test("Then cart is cleared, toast success and user is redirected", async () => {
                    const toastSpy = jest.spyOn(toast, "success")
                    render(<CartPage />)
                    const payment_button = await screen.findByRole("button", {name: "Make Payment"})
                
                    await waitFor(() => {
                        expect(DropIn).toHaveBeenCalled()
                    })
                    fireEvent.click(payment_button)
                    
                    await waitFor(() => {
                        expect(localStorage.removeItem).toHaveBeenCalledWith("cart")
                    })
                    const [_, mockSetCart] = Cart.useCart()
                    expect(mockSetCart).toHaveBeenCalledWith([])
                    expect(toastSpy).toHaveBeenCalled()
                    expect(useNavigate()).toHaveBeenCalled()
                })
            })
        });

        
    });

})

describe("Given no authentication", () => {
    beforeEach(() => {
        jest.spyOn(Auth, "useAuth").mockReturnValue([{
            user: "",
            token: false
        }, jest.fn()])
        jest.spyOn(axios, "post").mockResolvedValue({data: true})
    })
    describe("And a cart with items, with valid token and instance", () => {
        beforeEach(() => {
            let mockCart = mockProducts.slice()
            const mockSetCart = jest.fn((x) => {
                while(mockCart.length > 0) {
                    mockCart.pop()
                }
                while(mockCart.length !== x.length) {
                    mockCart.push(x[mockCart.length])
                }
                return mockCart
            })
            jest.spyOn(Cart, "useCart").mockImplementation(() => {
                return [mockCart, mockSetCart]})
            jest.spyOn(axios, "get").mockImplementation(
                () => {
                    return Promise.resolve({data: {clientToken: true}})
                }
            )
            DropIn.mockImplementation(jest.fn(({options, onInstance}) => {
                const {useEffect} = jest.requireActual("react")
        
                useEffect(() => {
                    onInstance({ 
                        requestPaymentMethod: () => {return {nonce: true}}
                    })
                }, [])
                return <></>
            }))
        })

        test.failing("Then ask user to login to checkout", async () => {
            render(<CartPage/>)
            const ask_login = screen.queryByText("please login to checkout", {exact: false})
            const login_button = screen.queryByRole("button", {name: "Please Login to checkout"})
            const payment_button = screen.queryByRole("button", {name: "Make Payment"})

            await waitFor(() => {
                expect(ask_login).toBeInTheDocument()
            })
            expect(login_button).toBeInTheDocument()
            expect(payment_button).not.toBeInTheDocument()
        })
    })
})

describe("Given authentication but no address", () => {
    beforeEach(() => {
        jest.spyOn(Auth, "useAuth").mockReturnValue([{
            user: {
                address: "",
                ...mockUsers[0]
            },
            token: true
        }, jest.fn()])
        jest.spyOn(axios, "post").mockResolvedValue({data: true})
        jest.spyOn(axios, "get").mockImplementation(
            () => {
                return Promise.resolve({data: {clientToken: true}})
            }
        )
        DropIn.mockImplementation(jest.fn(({options, onInstance}) => {
            const {useEffect} = jest.requireActual("react")
    
            useEffect(() => {
                onInstance({ 
                    requestPaymentMethod: () => {return {nonce: true}}
                })
            }, [])
            return <></>
        }))
    })
    describe("And a cart with items, with valid token and instance", () => {
        beforeEach(() => {
            let mockCart = mockProducts.slice()
            const mockSetCart = jest.fn((x) => {
                while(mockCart.length > 0) {
                    mockCart.pop()
                }
                while(mockCart.length !== x.length) {
                    mockCart.push(x[mockCart.length])
                }
                return mockCart
            })
            jest.spyOn(Cart, "useCart").mockImplementation(() => {
                return [mockCart, mockSetCart]})
        })

        test("Then ask user to update address and prevent checkout", async () => {
            render(<CartPage/>)
            

            const update_button = screen.queryByRole("button", {name: "Update Address"})
            const payment_button = screen.queryByRole("button", {name: "Make Payment"})
            await waitFor(() => {
                expect(update_button).toBeInTheDocument()
            })
            expect(payment_button).not.toBeInTheDocument()
            
        })
    })
})
