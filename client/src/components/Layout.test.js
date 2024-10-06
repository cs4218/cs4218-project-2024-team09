import React from "react";
import { render, screen } from "@testing-library/react";
import Layout from "./Layout";
import '@testing-library/jest-dom/extend-expect';

jest.mock('./Header', () => () => <div>Header Component</div>);
jest.mock('./Footer', () => () => <div>Footer Component</div>);

describe("Layout Component", () => {
  it("renders Header, Footer, and children", () => {
    render(
      <Layout>
        <div>Child Component</div>
      </Layout>
    );

    expect(screen.getByText(/header component/i)).toBeInTheDocument();
    expect(screen.getByText(/footer component/i)).toBeInTheDocument();
    expect(screen.getByText(/child component/i)).toBeInTheDocument();
  });
});
