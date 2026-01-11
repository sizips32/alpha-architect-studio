import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DevelopmentCanvas } from '../../components/DevelopmentCanvas';

describe('DevelopmentCanvas', () => {
  it('should render the main title', () => {
    render(<DevelopmentCanvas />);

    expect(screen.getByText('퀀트의 마인드셋: 알파 개발 가이드')).toBeDefined();
  });

  it('should render the description', () => {
    render(<DevelopmentCanvas />);

    expect(screen.getByText(/알파 아이디어를 생성하고 개선하는 데 도움을 줍니다/)).toBeDefined();
  });

  it('should render the "호기심 유지하기" card', () => {
    render(<DevelopmentCanvas />);

    expect(screen.getByText('호기심 유지하기')).toBeDefined();
    expect(screen.getByText(/새로운 아이디어를 끊임없이 실험하세요/)).toBeDefined();
  });

  it('should render the "손절 실행하기" card', () => {
    render(<DevelopmentCanvas />);

    expect(screen.getByText('손절 실행하기')).toBeDefined();
    expect(screen.getByText(/어떤 규칙도 영원히 완벽하게 작동하지 않음/)).toBeDefined();
  });

  it('should render the "고가치 작업에 집중하기" card', () => {
    render(<DevelopmentCanvas />);

    expect(screen.getByText('고가치 작업에 집중하기')).toBeDefined();
    expect(screen.getByText(/반복적인 작업을 자동화하세요/)).toBeDefined();
  });

  it('should render the "다양한 분야 탐색하기" card', () => {
    render(<DevelopmentCanvas />);

    expect(screen.getByText('다양한 분야 탐색하기')).toBeDefined();
    expect(screen.getByText(/익숙한 분야에 국한되지 마세요/)).toBeDefined();
  });

  it('should render 4 idea cards', () => {
    render(<DevelopmentCanvas />);

    // Each card has an icon wrapper with specific class
    const iconWrappers = document.querySelectorAll('.bg-gray-800.rounded-lg');
    expect(iconWrappers.length).toBe(4);
  });

  it('should have correct styling for the container', () => {
    const { container } = render(<DevelopmentCanvas />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toContain('bg-gray-900/50');
    expect(mainContainer.className).toContain('rounded-lg');
    expect(mainContainer.className).toContain('border-dashed');
  });

  it('should render all SVG icons', () => {
    render(<DevelopmentCanvas />);

    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBe(4);
  });
});
