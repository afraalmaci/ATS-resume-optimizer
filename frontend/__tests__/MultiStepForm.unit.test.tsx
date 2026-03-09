import { render, screen, fireEvent } from '@testing-library/react';
import MultiStepForm from '@/components/forms/MultiStepForm';

const steps = [
  <div key="step1">Step 1 Content</div>,
  <div key="step2">Step 2 Content</div>,
];

describe('MultiStepForm Unit Tests', () => {
  it('renders the first step initially', () => {
    render(<MultiStepForm steps={steps} />);
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
  });

  it('navigates to the next step on Next button click', () => {
    render(<MultiStepForm steps={steps} />);
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
  });

  it('shows Finish button on the last step', () => {
    render(<MultiStepForm steps={steps} />);
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });
});