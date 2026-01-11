import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoTooltip } from '../../components/InfoTooltip';

describe('InfoTooltip', () => {
  const tooltipText = 'This is a helpful tooltip message';

  it('should render the info icon', () => {
    render(<InfoTooltip text={tooltipText} />);

    // Check for SVG icon
    const svg = document.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('should not show tooltip by default', () => {
    render(<InfoTooltip text={tooltipText} />);

    expect(screen.queryByText(tooltipText)).toBeNull();
  });

  it('should show tooltip on mouse enter', () => {
    render(<InfoTooltip text={tooltipText} />);

    const container = document.querySelector('.relative');
    expect(container).toBeDefined();

    fireEvent.mouseEnter(container!);

    expect(screen.getByText(tooltipText)).toBeDefined();
  });

  it('should hide tooltip on mouse leave', () => {
    render(<InfoTooltip text={tooltipText} />);

    const container = document.querySelector('.relative');

    // Show tooltip
    fireEvent.mouseEnter(container!);
    expect(screen.getByText(tooltipText)).toBeDefined();

    // Hide tooltip
    fireEvent.mouseLeave(container!);
    expect(screen.queryByText(tooltipText)).toBeNull();
  });

  it('should have correct tooltip positioning classes', () => {
    render(<InfoTooltip text={tooltipText} />);

    const container = document.querySelector('.relative');
    fireEvent.mouseEnter(container!);

    const tooltip = screen.getByText(tooltipText);
    expect(tooltip.className).toContain('absolute');
    expect(tooltip.className).toContain('bottom-full');
  });

  it('should render different tooltip texts', () => {
    const customText = '사용자 정의 툴팁 메시지';
    render(<InfoTooltip text={customText} />);

    const container = document.querySelector('.relative');
    fireEvent.mouseEnter(container!);

    expect(screen.getByText(customText)).toBeDefined();
  });

  it('should have cursor pointer style on icon', () => {
    render(<InfoTooltip text={tooltipText} />);

    const svg = document.querySelector('svg');
    // SVG className is an SVGAnimatedString, so we need to use baseVal
    expect(svg?.className.baseVal).toContain('cursor-pointer');
  });
});
