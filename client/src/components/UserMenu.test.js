import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserMenu from "./UserMenu";
import '@testing-library/jest-dom/extend-expect';

describe("User Menu Component", () => {
  it("renders UserMenu with links", () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );

    const heading = screen.getByText(/dashboard/i);
    expect(heading).toBeInTheDocument();

    const profileLink = screen.getByRole("link", { name: /profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/dashboard/user/profile");

    const ordersLink = screen.getByRole("link", { name: /orders/i });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute("href", "/dashboard/user/orders");
  });
});
