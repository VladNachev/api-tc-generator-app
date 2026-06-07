import { TestCase } from '../types/api';

interface TestCaseCardProps {
  testCase: TestCase;
}

const priorityClass = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function TestCaseCard({ testCase }: TestCaseCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{testCase.id}</span>
            <span className={`rounded border px-2 py-1 text-xs font-bold ${priorityClass[testCase.priority]}`}>
              {testCase.priority}
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-950">{testCase.title}</h3>
        </div>
      </div>

      <div className="mt-4 grid gap-4 text-sm lg:grid-cols-2">
        <div>
          <p className="font-semibold text-slate-800">Preconditions</p>
          <p className="mt-1 text-slate-600">{testCase.preconditions}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800">Expected result</p>
          <p className="mt-1 text-slate-600">{testCase.expectedResult}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-slate-800">Steps</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          {testCase.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </article>
  );
}
