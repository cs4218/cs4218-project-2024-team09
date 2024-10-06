import React, { useEffect } from 'react';
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { CartProvider, useCart } from "./cart";

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes cart state as an empty array", () => {
    const TestComponent = () => {
      const [cart] = useCart();
      return <div>{cart.length}</div>;
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("retrieves cart data from localStorage on load", () => {
    const mockCartData = [{ id: 1, name: "Product 1", quantity: 2 }];
    localStorage.setItem("cart", JSON.stringify(mockCartData));

    const TestComponent = () => {
      const [cart] = useCart();
      return <div>{cart.length}</div>;
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByText("1")).toBeInTheDocument(); // Check if cart has 1 item
  });

  it("provides a setCart function to update cart state", () => {
    const TestComponent = () => {
      const [cart, setCart] = useCart();
      useEffect(() => {
        const newCartItem = [{ id: 2, name: "Product 2", quantity: 1 }];
        setCart(newCartItem);
      }, []);
      return <div>{cart.length}</div>;
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
