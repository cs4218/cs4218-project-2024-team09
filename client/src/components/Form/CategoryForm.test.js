import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "./CategoryForm";
import React from "react";
import '@testing-library/jest-dom';

describe("CategoryForm Component", () => {
  it("renders input and submit button", () => {
    render(<CategoryForm handleSubmit={jest.fn()} value="" setValue={jest.fn()} />);

    // Check if input element is rendered
    const inputElement = screen.getByPlaceholderText(/Enter new Category/i);
    expect(inputElement).toBeInTheDocument();

    // Check if submit button is rendered
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("calls setValue on input change", () => {
    const mockSetValue = jest.fn();
    render(<CategoryForm handleSubmit={jest.fn()} value="" setValue={mockSetValue} />);

    // Simulate user typing into input
    const inputElement = screen.getByPlaceholderText(/Enter new Category/i);
    fireEvent.change(inputElement, { target: { value: "New Category" } });

    // Verify that setValue was called with the new input value
    expect(mockSetValue).toHaveBeenCalledWith("New Category");
  });

  it("calls handleSubmit on form submission", () => {
    const mockHandleSubmit = jest.fn();
    render(<CategoryForm handleSubmit={mockHandleSubmit} value="New Category" setValue={jest.fn()} />);

    // Simulate user submitting the form
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.submit(submitButton); // Use fireEvent.submit to simulate form submission

    // Verify that handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});