import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import '@testing-library/jest-dom/extend-expect';

describe('Footer Component', () => {
  it('renders footer with correct text and links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check if the footer text is rendered
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();

    // Check if the links are rendered and have correct hrefs
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/policy');
  });
});
