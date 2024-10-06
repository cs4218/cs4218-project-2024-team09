import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import AdminRoute from "./AdminRoute";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { Outlet } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  Outlet: jest.fn(),
}));
jest.mock("../Spinner", () => () => <div>Loading...</div>);

describe("Admin Route Component", () => {
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders an Outlet when user is an admin', async () => {
    useAuth.mockReturnValue([{ user: 'admin', token: 'valid-token'}, mockSetAuth]);
    axios.get.mockResolvedValueOnce({ data: { ok: true }});
    Outlet.mockReturnValue(<div>Admin Content</div>);

    render(<AdminRoute />)

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/admin-auth"))
    const adminContent = await screen.findByText("Admin Content");
    expect(adminContent).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it('renders a Spinner when user is not an admin', async () => {
    useAuth.mockReturnValue([{ user: 'user', token: 'valid-token'}, mockSetAuth]);
    axios.get.mockResolvedValueOnce({ data: { ok: false }});

    render(<AdminRoute />)

    expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/admin-auth");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it('renders a Spinner when user is not authenticated', async () => {
    useAuth.mockReturnValue([{}, mockSetAuth]);

    render(<AdminRoute />)

    expect(axios.get).not.toHaveBeenCalled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
