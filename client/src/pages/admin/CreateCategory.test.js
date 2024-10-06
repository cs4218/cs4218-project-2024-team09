import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateCategory from './CreateCategory';
import axios from 'axios';
import toast from "react-hot-toast";

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu Mock</div>);
jest.mock("antd", () => ({
  Modal: ({ children, onCancel }) => (
    <div role="dialog" onClick={onCancel}>
      {children}
    </div>
  ),
}));
jest.mock('../../components/Form/CategoryForm', () => ({ handleSubmit, value, setValue }) => (
  <form onSubmit={handleSubmit}>
    <input
      placeholder="Enter category name"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    <button type="submit">Submit</button>
  </form>
));

describe('CreateCategory Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { success: true, category: [] } });
  });

  it('renders without crashing', async () => {
    render(<CreateCategory />);
    await waitFor(() => {
    expect(screen.getByText("Manage Category")).toBeInTheDocument();
    });
  });

  it('fetches and displays categories', async () => {
    const categories = [{ _id: '1', name: 'Category 1' }];
    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });

    render(<CreateCategory />);

    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });
  });

  it('handles form submission to create a category', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    render(<CreateCategory />);

    const input = screen.getAllByPlaceholderText('Enter category name');
    const button = screen.getAllByRole('button', { name: "Submit" });

    fireEvent.change(input[0], { target: { value: 'New Category' } });
    fireEvent.click(button[0]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('New Category is created');
    });
  });

  it('handles update category', async () => {
    const categories = [{ _id: '1', name: 'Category 1' }];
    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    render(<CreateCategory />);

    await waitFor(() => {
      expect(screen.getByText(/Category 1/i)).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const modal = screen.getByRole('dialog');
    const modalInput = within(modal).getByPlaceholderText(/Enter category name/i);
    const saveButton = within(modal).getByRole('button', { name: /submit/i });

    fireEvent.change(modalInput, { target: { value: 'Updated Category' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Updated Category is updated');
    });
  });

  it('handles delete category', async () => {
    const categories = [{ _id: '1', name: 'Category 1' }];
    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });
    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    render(<CreateCategory />);

    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('category is deleted');
    });
  });
});
