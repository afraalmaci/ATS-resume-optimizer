import MultiStepForm from "@/components/forms/MultiStepForm";
import ResumeUpload from "@/components/forms/ResumeUpload";
import JobDescriptionForm from "@/components/forms/JobDescriptionForm";

export default function TestFormPage() {
  const steps = [
    <ResumeUpload key="resume" />,
    <JobDescriptionForm key="job" />,
    <div key="result">Analysis Step</div>,
  ];

  return (
    <main style={{ padding: 50 }}>
      <h1>Multi-Step Form Test</h1>
      <MultiStepForm steps={steps} />
    </main>
  );
}