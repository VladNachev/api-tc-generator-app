import { Copy, Download, FileCheck2 } from 'lucide-react';
import { TestCase, TestCaseCategory } from '../types/api';
import { TestCaseCard } from './TestCaseCard';

interface OutputPanelProps {
  testCases: TestCase[];
  copyStatus: string;
  onCopyMarkdown: () => void;
  onExportCsv: () => void;
}

const categories: TestCaseCategory[] = [
  'Positive scenarios',
  'Negative scenarios',
  'Field validation',
  'Authentication & authorization',
  'Headers & content type',
  'Response validation',
  'Security checks',
  'Basic performance checks',
];

export function OutputPanel({ testCases, copyStatus, onCopyMarkdown, onExportCsv }: OutputPanelProps) {
  const priorityCounts = testCases.reduce(
    (acc, testCase) => {
      acc[testCase.priority] += 1;
      return acc;
    },
    { High: 0, Medium: 0, Low: 0 },
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Generated Test Cases</h2>
            <p className="mt-1 text-sm text-slate-600">
              {testCases.length > 0
                ? `${testCases.length} structured cases across QA coverage categories.`
                : 'Generate cases to see a categorized QA test suite.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={onCopyMarkdown}
              disabled={testCases.length === 0}
            >
              <Copy size={17} aria-hidden="true" />
              Copy as Markdown
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={onExportCsv}
              disabled={testCases.length === 0}
            >
              <Download size={17} aria-hidden="true" />
              Export as CSV
            </button>
          </div>
        </div>
        {copyStatus ? <p className="mt-3 text-sm font-medium text-emerald-700">{copyStatus}</p> : null}
      </div>

      {testCases.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <FileCheck2 size={28} aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-950">Ready for API coverage</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Fill in an endpoint contract or load the example to generate positive, negative, validation, auth, response, security, and performance checks.
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <SummaryCard label="Total" value={testCases.length} />
            <SummaryCard label="High" value={priorityCounts.High} />
            <SummaryCard label="Medium" value={priorityCounts.Medium} />
            <SummaryCard label="Low" value={priorityCounts.Low} />
          </div>

          {categories.map((category) => {
            const categoryCases = testCases.filter((testCase) => testCase.category === category);
            if (categoryCases.length === 0) {
              return null;
            }

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{category}</h3>
                  <span className="text-sm font-semibold text-slate-500">{categoryCases.length}</span>
                </div>
                {categoryCases.map((testCase) => (
                  <TestCaseCard key={testCase.id} testCase={testCase} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
