import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';

import Header from "./Header"

import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";

jest.mock("../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("react-hot-toast", () => ({ success: jest.fn() }))
jest.mock("./Form/SearchInput", () => jest.fn())
jest.mock("../hooks/useCategory", () => () => [
  { slug: "category1", name: "Category 1" },
  { slug: "category2", name: "Category 2" },
]);

describe("Header Component", () => {
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays categories in the dropdown", () => {
    useAuth.mockReturnValue([{}, mockSetAuth]);
    useCart.mockReturnValue([[]]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Categories")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Categories"));

    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 2")).toBeInTheDocument();
  });

  it("displays cart count correctly", () => {
    const cartItems = [{ id: 1 }, { id: 2 }];
    useAuth.mockReturnValue([{}, mockSetAuth]);
    useCart.mockReturnValue([cartItems]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  describe("When user is not authenticated", () => {
    it('renders Header with register and login option', () => {
      useAuth.mockReturnValue([{}, mockSetAuth]);
      useCart.mockReturnValue([]);

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      )

      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });
  })

  describe("When user is authenticated", () => {
    it('renders Header with username and logout option', () => {
      useAuth.mockReturnValue([{ user: { name: "Hans Gruber" }, token: "valid-token" }, mockSetAuth]);

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      )

      expect(screen.queryByText("Register")).not.toBeInTheDocument();
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
      expect(screen.getByText("Hans Gruber")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("calls handleLogout function and removes auth on logout", async () => {
      const user = { name: "John McClane" };

      const setAuth = jest.fn((newAuth) => {
        authState = newAuth;
      });
      let authState = { user, token: "valid-token" };

      useAuth.mockReturnValue([authState, setAuth]);
      useCart.mockReturnValue([[]]);

      const localStorageSpy = jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
  
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
  
      fireEvent.click(screen.getByText("John McClane"));
      fireEvent.click(screen.getByText("Logout"));
  
      await waitFor(() => expect(setAuth).toHaveBeenCalledWith({
        user: null,
        token: "",
      }));

      expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
      expect(toast.success).toHaveBeenCalledWith("Logout Successfully");

      localStorageSpy.mockRestore()
    });
  })
})
