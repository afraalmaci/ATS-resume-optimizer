import { render, screen, fireEvent } from '@testing-library/react';
import MultiStepForm from '../MultiStepForm';

const steps = [
  <div key="step1">Step 1 Content</div>,
  <div key="step2">Step 2 Content</div>,
  <div key="step3">Step 3 Content</div>,
];

const nextButton = () => screen.getByRole('button', { name: 'Next' });
const backButton = () => screen.getByRole('button', { name: 'Back' });

// AnimatePresence mode="wait" mounts the next step only after the exit
// animation of the current one finishes, so step transitions are asserted
// with async findBy* queries instead of synchronous getBy* queries.
describe('MultiStepForm', () => {
  it('renders the first step with Next and without Back', () => {
    render(<MultiStepForm steps={steps} />);
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(nextButton()).toBeInTheDocument();
  });

  it('goes to the next step and shows Back', async () => {
    render(<MultiStepForm steps={steps} />);
    fireEvent.click(nextButton());
    expect(await screen.findByText('Step 2 Content')).toBeInTheDocument();
    expect(screen.queryByText('Step 1 Content')).not.toBeInTheDocument();
    expect(backButton()).toBeInTheDocument();
  });

  it('goes back to the previous step', async () => {
    render(<MultiStepForm steps={steps} />);
    fireEvent.click(nextButton());
    await screen.findByText('Step 2 Content');
    fireEvent.click(backButton());
    expect(await screen.findByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Step 2 Content')).not.toBeInTheDocument();
  });

  it('hides Next on the last step, where the step content owns submission', async () => {
    render(<MultiStepForm steps={steps} />);
    fireEvent.click(nextButton());
    await screen.findByText('Step 2 Content');
    fireEvent.click(nextButton());
    expect(await screen.findByText('Step 3 Content')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });
});
