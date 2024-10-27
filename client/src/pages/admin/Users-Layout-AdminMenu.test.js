import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Users from './Users';
import AdminMenu from '../../components/AdminMenu';
import Layout from '../../components/Layout';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../components/Header', () => () => <div>Header</div>);


describe("Users Component", () => {
  it("renders the Users page with Layout and AdminMenu components", async () => {
    render(<MemoryRouter><Users /></MemoryRouter>);

    //Check if the Layout component is rendered correct in User
    
    await waitFor(() => {
      expect(document.title).toBe("Dashboard - All Users");
  });
    expect(screen.getByText("All Users")).toBeInTheDocument();

    //Check if the AdminMenu is rendered correctly in User
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });
});
