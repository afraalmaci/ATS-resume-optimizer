import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import JobDescriptionForm from '../JobDescriptionForm';

const textarea = () => screen.getByPlaceholderText('Enter job description here...');

describe('JobDescriptionForm', () => {
  it('allows up to 10,000 characters by default', () => {
    render(<JobDescriptionForm value="" onChange={() => {}} />);
    expect(screen.getByText('0 / 10000')).toBeInTheDocument();
  });

  it('accepts a job description longer than 500 characters', () => {
    const onChange = vi.fn();
    render(<JobDescriptionForm value="" onChange={onChange} />);
    const text = 'a'.repeat(600);
    fireEvent.change(textarea(), { target: { value: text } });
    expect(onChange).toHaveBeenCalledWith(text);
  });

  it('cuts pasted text to the limit instead of ignoring it', () => {
    const onChange = vi.fn();
    render(<JobDescriptionForm value="" onChange={onChange} maxChars={100} />);
    fireEvent.change(textarea(), { target: { value: 'a'.repeat(150) } });
    expect(onChange).toHaveBeenCalledWith('a'.repeat(100));
  });
});
