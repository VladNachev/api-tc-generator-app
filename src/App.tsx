import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { emptyForm, exampleForm } from './data/example';
import { downloadCsv, toCsv, toMarkdown } from './logic/exporters';
import { generateTestCases } from './logic/generator';
import { validateFormJson } from './logic/parser';
import { ApiFormData, TestCase } from './types/api';

function App() {
  const [form, setForm] = useState<ApiFormData>(emptyForm);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState('');

  const markdown = useMemo(() => toMarkdown(testCases), [testCases]);

  function updateField(field: keyof ApiFormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors([]);
    setCopyStatus('');
  }

  function handleGenerate() {
    const validationErrors = validateFormJson(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setCopyStatus('');
    setTestCases(generateTestCases(form));
  }

  function handleLoadExample() {
    setForm(exampleForm);
    setErrors([]);
    setCopyStatus('');
    setTestCases(generateTestCases(exampleForm));
  }

  function handleClear() {
    setForm(emptyForm);
    setErrors([]);
    setCopyStatus('');
    setTestCases([]);
  }

  async function handleCopyMarkdown() {
    if (!markdown) {
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus('Markdown copied to clipboard.');
    } catch {
      setCopyStatus('Copy failed in this browser. You can still export CSV.');
    }
  }

  function handleExportCsv() {
    downloadCsv(toCsv(testCases), 'api-test-cases.csv');
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-700 text-white">
                <ShieldCheck size={25} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Rule-based QA tool</p>
                <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">API Test Case Generator</h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Generate structured API test cases from endpoint details, payload fields, authentication, response expectations, and business rules.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(380px,0.9fr)_minmax(520px,1.1fr)] lg:px-8">
        <InputPanel
          form={form}
          errors={errors}
          onChange={updateField}
          onGenerate={handleGenerate}
          onLoadExample={handleLoadExample}
          onClear={handleClear}
        />
        <OutputPanel
          testCases={testCases}
          copyStatus={copyStatus}
          onCopyMarkdown={handleCopyMarkdown}
          onExportCsv={handleExportCsv}
        />
      </div>
    </main>
  );
}

export default App;
