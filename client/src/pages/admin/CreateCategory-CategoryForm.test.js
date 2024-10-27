import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import axios from "axios";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";
import CategoryForm from "../../components/Form/CategoryForm";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast", () => ({ error: jest.fn(), success: jest.fn() }));
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu Mock</div>);
jest.mock("antd", () => ({
  Modal: ({ children, onCancel }) => (
    <div role="dialog" onClick={onCancel}>
      {children}
    </div>
  ),
}));

describe("CreateCategory Intergration testing with CategoryForm", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: { success: true, category: [{ _id: "1", name: "Testing Category" }] },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Renders category list and form", async () => {
    render(<CreateCategory />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    await waitFor(() => {
    expect(screen.getByText("Testing Category")).toBeInTheDocument();
    });
    await waitFor(() => {
        expect(screen.getAllByPlaceholderText("Enter new category")[0]).toBeInTheDocument();
    });
  });

  it("Submits a new category successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, message: "Category created" } });

    render(<CreateCategory />
    );

    // Enter a new category name
    fireEvent.change(screen.getAllByPlaceholderText("Enter new category")[0], {
      target: { value: "Updated Test Category" },
    });
    fireEvent.click(screen.getAllByText("Submit")[0]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", { name: "Updated Test Category" });
    });

    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Updated Test Category is created");
    })
  });

  it("Updates a category name successfully", async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true, message: "Category updated" } });

    render(<CreateCategory />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    await waitFor(() => {
        expect(screen.getByText("Testing Category")).toBeInTheDocument();
        });
    // Open edit modal for category "Testing Category"
    fireEvent.click(screen.getByText("Edit"));

    // Update category name
    const input = screen.getAllByPlaceholderText("Enter new category")[1];
    fireEvent.change(input, { target: { value: "Updated Testing Category" } });
    fireEvent.click(screen.getAllByText("Submit")[1]);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/1",
        { name: "Updated Testing Category" }
      );
    });

    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Updated Testing Category is updated");
      });
  });

  it("Deletes a category successfully", async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true, message: "Category deleted" } });

    render(<CreateCategory />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    await waitFor(() => {
        expect(screen.getByText("Testing Category")).toBeInTheDocument();
    });
    // Click delete button for category "Testing Category"
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/v1/category/delete-category/1");
    });

    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("category is deleted");
      });
  });
});
