import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../components/Footer';

describe('Footer', () => {
  it('should render the footer element', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeDefined();
  });

  it('should display the copyright text in Korean', () => {
    render(<Footer />);

    expect(screen.getByText(/알파 아키텍트/)).toBeDefined();
    expect(screen.getByText(/시뮬레이션 및 교육 목적으로만 사용하세요/)).toBeDefined();
  });

  it('should display the current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeDefined();
  });

  it('should have correct styling classes', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('bg-gray-950');
    expect(footer.className).toContain('border-t');
  });
});
