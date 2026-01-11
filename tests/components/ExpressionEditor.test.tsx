import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpressionEditor } from '../../components/ExpressionEditor';

describe('ExpressionEditor', () => {
  const defaultProps = {
    expression: 'rank(close, 20)',
    setExpression: vi.fn(),
    onGenerate: vi.fn(),
    isAiLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the title', () => {
    render(<ExpressionEditor {...defaultProps} />);

    expect(screen.getByText('알파 수식')).toBeDefined();
  });

  it('should render the description', () => {
    render(<ExpressionEditor {...defaultProps} />);

    expect(screen.getByText(/수학 및 논리 연산자를 사용하여/)).toBeDefined();
  });

  it('should render the expression textarea', () => {
    render(<ExpressionEditor {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(
      '예: rank(close / delay(close, 1))'
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(defaultProps.expression);
  });

  it('should call setExpression when textarea changes', () => {
    render(<ExpressionEditor {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('예: rank(close / delay(close, 1))');
    fireEvent.change(textarea, { target: { value: 'new expression' } });

    expect(defaultProps.setExpression).toHaveBeenCalledWith('new expression');
  });

  it('should render AI generation section', () => {
    render(<ExpressionEditor {...defaultProps} />);

    expect(screen.getByText('AI로 생성하기')).toBeDefined();
  });

  it('should render AI idea input', () => {
    render(<ExpressionEditor {...defaultProps} />);

    const aiInput = screen.getByPlaceholderText('트레이딩 아이디어를 설명하세요...');
    expect(aiInput).toBeDefined();
  });

  it('should render generate button', () => {
    render(<ExpressionEditor {...defaultProps} />);

    expect(screen.getByText('생성')).toBeDefined();
  });

  it('should call onGenerate when generate button is clicked', () => {
    render(<ExpressionEditor {...defaultProps} />);

    const aiInput = screen.getByPlaceholderText('트레이딩 아이디어를 설명하세요...');
    fireEvent.change(aiInput, { target: { value: 'momentum strategy' } });

    const generateButton = screen.getByText('생성');
    fireEvent.click(generateButton);

    expect(defaultProps.onGenerate).toHaveBeenCalledWith('momentum strategy');
  });

  it('should disable generate button when isAiLoading is true', () => {
    render(<ExpressionEditor {...defaultProps} isAiLoading={true} />);

    const generateButton = screen.getByRole('button');
    expect(generateButton.hasAttribute('disabled')).toBe(true);
  });

  it('should show loader icon when isAiLoading is true', () => {
    render(<ExpressionEditor {...defaultProps} isAiLoading={true} />);

    // Should not show "생성" text when loading
    expect(screen.queryByText('생성')).toBeNull();
    // Should show loading spinner (SVG with animate-spin class)
    const svg = document.querySelector('svg.animate-spin');
    expect(svg).toBeDefined();
  });

  it('should have correct placeholder text', () => {
    render(<ExpressionEditor {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('예: rank(close / delay(close, 1))');
    expect(textarea).toBeDefined();
  });

  it('should render with empty expression', () => {
    render(<ExpressionEditor {...defaultProps} expression="" />);

    const textarea = screen.getByPlaceholderText(
      '예: rank(close / delay(close, 1))'
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });
});
