import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import Private from "./Private";
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

describe("Private Component", () => {
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders an Outlet when user is authenticated', async () => {
    useAuth.mockReturnValue([{ user: 'user', token: 'valid-token'}, mockSetAuth]);
    axios.get.mockResolvedValueOnce({ data: { ok: true }});
    Outlet.mockReturnValue(<div>User Content</div>);

    render(<Private />)

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth"))
    const adminContent = await screen.findByText("User Content");
    expect(adminContent).toBeInTheDocument();
  });

  it('renders a Spinner when user is not authenticated', async () => {
    useAuth.mockReturnValue([{}, mockSetAuth]);

    render(<Private />)

    expect(axios.get).not.toHaveBeenCalled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
