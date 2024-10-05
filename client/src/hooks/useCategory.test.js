import React from 'react';
import { render, renderHook, screen, act } from "@testing-library/react";
import '@testing-library/jest-dom';
import useCategory from "./useCategory";
import axios from 'axios';


jest.mock("axios");
//data fetched with 2 entries array in category
const testCategories1 = {category: ["Category 1", "Category 2"]};
//data fetched with empty array in category
const testCategories2 = {category: []};
//data fetched is null
const testCategories3 = {category: null};
//data fetched with no category property
const testCategories4 = {categories: ["Category 1", "Category 2"]};

const mockAxiosGet = (mockData) => {
    axios.get.mockImplementationOnce(() => Promise.resolve({data: mockData}));
}

describe("useCategory", () => {
  it("data fetched with 2 entries array in category", async () => {
    mockAxiosGet(testCategories1);
    const MockComponent = () => {
        const categories = useCategory();
        return <div>{categories.toString()}</div>;
    }
    render(<MockComponent></MockComponent>);
    const find = await screen.findByText(testCategories1.category.toString());
    expect(find).toBeInTheDocument();

  });

  it("data fetched with empty array in category", async () => {
    mockAxiosGet(testCategories2);
    const MockComponent = () => {
        const categories = useCategory();
        return <div data-testid="test">{categories.toString()}</div>;
    }
    render(<MockComponent></MockComponent>);
    const find = await screen.findByTestId("test");
    expect(find).toContainHTML('<div data-testid="test"></div>');
  });

  it("data fetched is null", async () => {
    mockAxiosGet(testCategories3);
    const MockComponent = () => {
        const categories = useCategory();
        return <div data-testid="test">{categories}</div>;
    }
    render(<MockComponent></MockComponent>);
    const find = await screen.findByTestId("test");
    expect(find).toContainHTML('<div data-testid="test"></div>');
  });

  it("data fetched with no category property", async () => {
    mockAxiosGet(testCategories4);
    const MockComponent = () => {
        const categories = useCategory();
        return <div data-testid="test">{categories}</div>;
    }
    render(<MockComponent></MockComponent>);
    const find = await screen.findByTestId("test");
    expect(find).toContainHTML('<div data-testid="test"></div>');
  });
});
