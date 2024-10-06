import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CategoryForm from './CategoryForm';

describe('Category Form Component', () => {
  it('calls handleSubmit with empty input', () => {
    const mockHandleSubmit = jest.fn();
    render(<CategoryForm value="" setValue={jest.fn()} handleSubmit={mockHandleSubmit} />);
    
    fireEvent.submit(screen.getByRole('button'));

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('calls handleSubmit with single character input', () => {
    const mockHandleSubmit = jest.fn();
    render(<CategoryForm value="A" setValue={jest.fn()} handleSubmit={mockHandleSubmit} />);
    
    fireEvent.submit(screen.getByRole('button'));

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('calls handleSubmit with 255 characters input', () => {
    const mockHandleSubmit = jest.fn();
    const longValue = 'a'.repeat(255); // Test boundary value

    render(<CategoryForm value={longValue} setValue={jest.fn()} handleSubmit={mockHandleSubmit} />);
    
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('calls setValue on input change', () => {
    const mockSetValue = jest.fn();
    render(<CategoryForm value="" setValue={mockSetValue} handleSubmit={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Enter new category'), {
      target: { value: 'New Category' },
    });

    expect(mockSetValue).toHaveBeenCalledWith('New Category');
  });

  it('calls setValue multiple times as input changes', () => {
    const mockSetValue = jest.fn();

    render(<CategoryForm value="" setValue={mockSetValue} handleSubmit={jest.fn()} />);

    const input = screen.getByPlaceholderText('Enter new category');

    // Simulate typing various input changes
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.change(input, { target: { value: 'AB' } });
    fireEvent.change(input, { target: { value: 'ABC' } });

    // Ensure setValue is called with the updated value each time
    expect(mockSetValue).toHaveBeenCalledWith('A');
    expect(mockSetValue).toHaveBeenCalledWith('AB');
    expect(mockSetValue).toHaveBeenCalledWith('ABC');

    // Check how many times setValue was called
    expect(mockSetValue).toHaveBeenCalledTimes(3);
  });
});
