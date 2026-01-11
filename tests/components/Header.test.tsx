import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../../components/Header';

describe('Header', () => {
  it('should render the header element', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toBeDefined();
  });

  it('should display the app title in Korean', () => {
    render(<Header />);

    expect(screen.getByText('알파 아키텍트')).toBeDefined();
  });

  it('should display the subtitle', () => {
    render(<Header />);

    expect(screen.getByText('퀀트 전략 스튜디오')).toBeDefined();
  });

  it('should render the chart icon', () => {
    render(<Header />);

    // Check for SVG element within the header
    const header = screen.getByRole('banner');
    const svg = header.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('should have sticky positioning', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
  });

  it('should have correct background styling', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('bg-gray-900/50');
    expect(header.className).toContain('backdrop-blur-sm');
  });
});
