import { render, screen, fireEvent } from '@testing-library/react';
import MultiStepForm from '../MultiStepForm';
import { toast } from 'react-hot-toast';

// toast mock
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const steps = [
  <div key="step1">Step 1 Content</div>,
  <div key="step2">Step 2 Content</div>,
  <div key="step3">Step 3 Content</div>,
];

describe('MultiStepForm', () => {
  it('should render first step correctly', () => {
    render(<MultiStepForm steps={steps} />);
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should go to next step when Next button is clicked', () => {
    render(<MultiStepForm steps={steps} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should go back to previous step when Back button is clicked', () => {
    render(<MultiStepForm steps={steps} />);
    fireEvent.click(screen.getByText('Next')); // Step 2
    fireEvent.click(screen.getByText('Back')); // Step 1
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
  });

  it('should call toast success on Finish', async () => {
    render(<MultiStepForm steps={steps} />);
    // Go to last step
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Finish'));
    expect(toast.success).toHaveBeenCalledWith('Form successfully submitted!');
  });
});