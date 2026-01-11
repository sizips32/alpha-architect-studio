import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorsActivationNotice } from '../../components/CorsActivationNotice';

describe('CorsActivationNotice', () => {
  const defaultProps = {
    activationUrl: 'https://cors-anywhere.herokuapp.com/corsdemo',
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the alert', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('should display the title', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    expect(screen.getByText('Action Required: Activate Data Proxy')).toBeDefined();
  });

  it('should display the activation instructions', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    expect(screen.getByText(/this app uses a public proxy service/)).toBeDefined();
    expect(screen.getByText(/click the button below to open the activation page/)).toBeDefined();
  });

  it('should render the activation link with correct href', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    const link = screen.getByRole('link', { name: /Activate Proxy Service/ });
    expect(link.getAttribute('href')).toBe(defaultProps.activationUrl);
  });

  it('should open link in new tab', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    const link = screen.getByRole('link', { name: /Activate Proxy Service/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    const dismissButton = screen.getByLabelText('Dismiss');
    fireEvent.click(dismissButton);

    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should render warning icon', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should have correct styling classes', () => {
    render(<CorsActivationNotice {...defaultProps} />);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-yellow-900/50');
    expect(alert.className).toContain('border-yellow-700');
  });
});
