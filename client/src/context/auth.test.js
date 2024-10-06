import React, { useEffect } from 'react';
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from "./auth";
import axios from 'axios';

jest.mock("axios");

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    axios.defaults.headers.common["Authorization"] = undefined;
  });

  const mockAuthData = {
    user: { name: "John Doe" },
    token: "test-token",
  };

  it("sets authorization header for axios", () => {
    const TestComponent = () => {
      const [auth] = useAuth();
      return <div>{auth.token}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });

  it("retrieves auth data from localStorage on load", async () => {

    localStorage.setItem("auth", JSON.stringify(mockAuthData));
    const TestComponent = () => {
      const [auth] = useAuth();
      return <p>{auth.user ? auth.user.name : "Loading"}</p>;
    };

    render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(axios.defaults.headers.common["Authorization"]).toBe(mockAuthData.token);
  });

  it("provides a setAuth function to update state", () => {
    const TestComponent = () => {
      const [auth, setAuth] = useAuth();
      useEffect(() => {
        setAuth(mockAuthData);
      }, [])
      return <p>{auth.user ? auth.user.name : "Loading"}</p>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(axios.defaults.headers.common["Authorization"]).toBe(mockAuthData.token);
  });
});
