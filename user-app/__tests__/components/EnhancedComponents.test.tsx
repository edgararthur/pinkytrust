import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  EnhancedButton, 
  EnhancedCard, 
  EnhancedBadge, 
  EnhancedProgress,
  EnhancedInput,
  EnhancedSelect 
} from '@/components/ui/EnhancedComponents';
import { HeartIcon } from '@heroicons/react/24/outline';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('EnhancedButton', () => {
  it('renders with default props', () => {
    render(<EnhancedButton>Click me</EnhancedButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<EnhancedButton variant="secondary">Secondary</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100');

    rerender(<EnhancedButton variant="success">Success</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');

    rerender(<EnhancedButton variant="error">Error</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<EnhancedButton size="sm">Small</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<EnhancedButton size="lg">Large</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('renders with icon', () => {
    render(<EnhancedButton icon={HeartIcon}>With Icon</EnhancedButton>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Icon should be rendered as SVG
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<EnhancedButton onClick={handleClick}>Click me</EnhancedButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<EnhancedButton loading>Loading</EnhancedButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-75');
  });

  it('is disabled when disabled prop is true', () => {
    render(<EnhancedButton disabled>Disabled</EnhancedButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });

  it('renders as link when href is provided', () => {
    render(<EnhancedButton href="/test">Link Button</EnhancedButton>);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});

describe('EnhancedCard', () => {
  it('renders with default props', () => {
    render(<EnhancedCard>Card content</EnhancedCard>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'border');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<EnhancedCard variant="elevated">Elevated</EnhancedCard>);
    expect(screen.getByText('Elevated')).toHaveClass('shadow-lg');

    rerender(<EnhancedCard variant="outlined">Outlined</EnhancedCard>);
    expect(screen.getByText('Outlined')).toHaveClass('border-2');
  });

  it('applies hover effects when hover prop is true', () => {
    render(<EnhancedCard hover>Hoverable</EnhancedCard>);
    expect(screen.getByText('Hoverable')).toHaveClass('hover:shadow-md');
  });

  it('applies clickable styles when clickable prop is true', () => {
    render(<EnhancedCard clickable>Clickable</EnhancedCard>);
    expect(screen.getByText('Clickable')).toHaveClass('cursor-pointer');
  });
});

describe('EnhancedBadge', () => {
  it('renders with default props', () => {
    render(<EnhancedBadge>Badge</EnhancedBadge>);
    const badge = screen.getByText('Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<EnhancedBadge variant="primary">Primary</EnhancedBadge>);
    expect(screen.getByText('Primary')).toHaveClass('bg-primary-100', 'text-primary-800');

    rerender(<EnhancedBadge variant="success">Success</EnhancedBadge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<EnhancedBadge variant="error">Error</EnhancedBadge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<EnhancedBadge size="sm">Small</EnhancedBadge>);
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs');

    rerender(<EnhancedBadge size="lg">Large</EnhancedBadge>);
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1', 'text-sm');
  });
});

describe('EnhancedProgress', () => {
  it('renders with default props', () => {
    render(<EnhancedProgress value={50} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('calculates percentage correctly', () => {
    render(<EnhancedProgress value={25} max={50} />);
    const progressBar = screen.getByRole('progressbar');
    const progressFill = progressBar.querySelector('[style*="width: 50%"]');
    expect(progressFill).toBeInTheDocument();
  });

  it('shows value when showValue is true', () => {
    render(<EnhancedProgress value={75} max={100} showValue />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<EnhancedProgress value={50} max={100} variant="success" />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('.bg-green-600')).toBeInTheDocument();

    rerender(<EnhancedProgress value={50} max={100} variant="error" />);
    expect(progressBar.querySelector('.bg-red-600')).toBeInTheDocument();
  });
});

describe('EnhancedInput', () => {
  it('renders with default props', () => {
    render(<EnhancedInput placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(<EnhancedInput label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<EnhancedInput error="This field is required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows help text', () => {
    render(<EnhancedInput helpText="Enter your username" />);
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<EnhancedInput icon={HeartIcon} />);
    const container = screen.getByRole('textbox').parentElement;
    expect(container?.querySelector('svg')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = jest.fn();
    render(<EnhancedInput onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});

describe('EnhancedSelect', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders with options', () => {
    render(<EnhancedSelect options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Check if options are rendered
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<EnhancedSelect label="Choose option" options={options} />);
    expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<EnhancedSelect options={options} error="Please select an option" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-300');
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('handles selection changes', () => {
    const handleChange = jest.fn();
    render(<EnhancedSelect options={options} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder when provided', () => {
    render(<EnhancedSelect options={options} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });
});
