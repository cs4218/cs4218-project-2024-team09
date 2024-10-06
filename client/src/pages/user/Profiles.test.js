import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as Auth from '../../context/auth'
import axios from 'axios';
import Profile from './Profile';
import toast from 'react-hot-toast';
import { mockUsers } from '../Mock';

jest.mock("../../components/UserMenu", () => {
    return () => <></>
})

jest.mock("./../../components/Layout", () => {
    return ({children}) => <>{children}</>
})

Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn().mockReturnValue(JSON.stringify({user: {}})),
      removeItem: jest.fn(),
    },
    writable: true,
});

const renderAndFillForm = (data) => {
    render(<Profile />)
    const email_input = screen.getByPlaceholderText("Enter Your Email")
    const pass_input = screen.getByPlaceholderText("Enter Your Password")
    const name_input = screen.getByPlaceholderText("Enter Your Name")
    const phone_input = screen.getByPlaceholderText("Enter Your Phone")
    const address_input = screen.getByPlaceholderText("Enter Your Address")

    fireEvent.change(email_input, data.email)
    fireEvent.change(pass_input, data.pass)
    fireEvent.change(name_input, data.name)
    fireEvent.change(phone_input, data.phone)
    fireEvent.change(address_input, data.address)
}

afterEach(() => {
    jest.resetAllMocks()
})

describe("Given Authentication", () => {
    beforeEach(() => {
        jest.spyOn(Auth, "useAuth").mockReturnValue([{user: mockUsers[0]}, () => {}])
    })

    describe("And correct input that API accepts", () => {
        beforeEach(() => {
            jest.spyOn(axios, "put").mockResolvedValue({data: {updatedUser: mockUsers[1]}})
        })
        describe("When form is submitted", () => {
            test("Then toast should succeed", async () => {   
                const toastSpy = jest.spyOn(toast, "success")
                renderAndFillForm(mockUsers[1])
                fireEvent.click(screen.getByRole("button"))                     
                
                await waitFor(() => {
                    expect(toastSpy).toHaveBeenCalled()
                })
                expect(localStorage.setItem).toHaveBeenCalledWith("auth", JSON.stringify({user: mockUsers[1]}))
            })
        })
    })
    describe("And wrong input that API rejects", () => {
        beforeEach(() => {
            jest.spyOn(axios, "put").mockResolvedValue({error: "Invalid"})
        })
        describe("When form is submitted", () => {
            test.failing("Then toast should error", async () => {
                const toastSpy = jest.spyOn(toast, "error")
                // remove expected error logs
                jest.spyOn(console, "log").mockImplementation(jest.fn())
                renderAndFillForm(mockUsers[1])
                fireEvent.click(screen.getByRole("button"))                     
                
                await waitFor(() => {
                    expect(toastSpy).toHaveBeenCalledWith("Invalid")
                })
            })
        })
    })
})