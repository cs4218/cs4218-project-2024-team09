import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import '@testing-library/jest-dom/extend-expect';

describe("Admin Menu Component", () => {
  it("renders AdminMenu with links", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const heading = screen.getByText(/admin panel/i);
    expect(heading).toBeInTheDocument();

    const createCategoryLink = screen.getByRole("link", { name: /create category/i });
    expect(createCategoryLink).toBeInTheDocument();
    expect(createCategoryLink).toHaveAttribute("href", "/dashboard/admin/create-category");

    const createProductLink = screen.getByRole("link", { name: /create product/i });
    expect(createProductLink).toBeInTheDocument();
    expect(createProductLink).toHaveAttribute("href", "/dashboard/admin/create-product");

    const productsLink = screen.getByRole("link", { name: /products/i });
    expect(productsLink).toBeInTheDocument();
    expect(productsLink).toHaveAttribute("href", "/dashboard/admin/products");

    const ordersLink = screen.getByRole("link", { name: /orders/i });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute("href", "/dashboard/admin/orders");
  });
});
