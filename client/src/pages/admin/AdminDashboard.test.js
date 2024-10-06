import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import AdminDashboard from "./AdminDashboard"; // Adjust the import path as necessary
import { useAuth } from "../../context/auth";

// Mocking the AdminMenu component
jest.mock("../../components/AdminMenu", () => () => <div>Admin Menu</div>);
// Mocking the useAuth hook
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);

// Test cases for AdminDashboard
describe("AdminDashboard", () => {

  it("renders admin details when auth data is provided", () => {
    const mockAuthData = {
        user: { 
            name: "John Doe",
            email: "admin@example.com",
            phone: "123-456-7890"},
      };
    useAuth.mockReturnValue([mockAuthData]);
    render(
      <AdminDashboard />
    );

    // Assertions
    expect(screen.getByText(/Admin Name : John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email : admin@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact : 123-456-7890/i)).toBeInTheDocument();
  });

  it("renders loading state when auth data omit user", () => {
    const mockAuthData = {
        user: null,
    }
    useAuth.mockReturnValue([mockAuthData]);
    render(
        <AdminDashboard />
    );

    // Assertions for loading state or fallback message if applicable
    expect(screen.getByText(/Admin Name :/i)).toBeInTheDocument(); // Adjust if there's a loading state
    expect(screen.getByText(/Admin Email :/i)).toBeInTheDocument(); // Adjust if there's a loading state
    expect(screen.getByText(/Admin Contact :/i)).toBeInTheDocument(); // Adjust if there's a loading state
  });

  it("renders loading state when one of the user filed is ommited", () => {
    const mockAuthData = {
        user: { 
            name: "John Doe",
            email: "admin@example.com",
        },
    }
    useAuth.mockReturnValue([mockAuthData]);
    render(
        <AdminDashboard />
    );

    // Assertions for loading state or fallback message if applicable
    expect(screen.getByText(/Admin Name : John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email : admin@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact :/i)).toBeInTheDocument(); // Adjust if there's a loading state
  });
});
