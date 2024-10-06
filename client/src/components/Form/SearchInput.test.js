import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(),
}));
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("Search Input Component", () => {
  const mockSetValues = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useSearch.mockReturnValue([
      { keyword: "", results: [] },
      mockSetValues,
    ]);
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders input and button correctly", () => {
    render(<SearchInput />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    const searchButton = screen.getByRole("button", { name: /search/i });
    
    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  it("calls axios.get and navigate on form submit", async () => {
    const mockResponse = { data: ["result1", "result2"] };
    axios.get.mockResolvedValueOnce(mockResponse);

    // Since the input is a controlled component, we do not simulate typing,
    // but mock the keyword value directly.
    useSearch.mockReturnValue([
      { keyword: "test", results: [] },
      mockSetValues,
    ]);

    render(<SearchInput />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Blocks until axios resolves
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/test"));

    expect(mockSetValues).toHaveBeenCalledWith({
      keyword: "test",
      results: mockResponse.data,
    })
    expect(mockNavigate).toHaveBeenCalledWith("/search");
  });

  it("logs error when axios request fails", async () => {
    const mockError = new Error("Network Error");
    axios.get.mockRejectedValueOnce(mockError);

    // Since the input is a controlled component, we do not simulate typing,
    // but mock the keyword value directly.
    useSearch.mockReturnValue([
      { keyword: "test", results: [] },
      mockSetValues,
    ]);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(<SearchInput />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/test"));
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
