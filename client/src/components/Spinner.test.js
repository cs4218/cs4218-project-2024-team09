import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { act } from "react-dom/test-utils";
import Spinner from "./Spinner";
import '@testing-library/jest-dom/extend-expect';

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({ pathname: "/some-path" })),
}));

describe("Spinner Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    jest.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it("renders Spinner with countdown", () => {
    render(
      <MemoryRouter initialEntries={["/some-path"]}>
        <Routes>
          <Route path="/some-path" element={<Spinner />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("navigates to the specified path after countdown", async () => {
    render(
      <MemoryRouter initialEntries={["/some-path"]}>
        <Routes>
          <Route path="/some-path" element={<Spinner />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/some-path" });
  });

  it("stops the countdown when unmounted", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval").mockImplementation(() => {});

    const { unmount } = render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore()
  });
});
