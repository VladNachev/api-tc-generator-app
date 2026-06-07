import { ClipboardList, Eraser, Wand2 } from 'lucide-react';
import { ApiFormData, AuthType, HttpMethod } from '../types/api';
import { fieldClass, FormField } from './FormField';

interface InputPanelProps {
  form: ApiFormData;
  errors: string[];
  onChange: (field: keyof ApiFormData, value: string) => void;
  onGenerate: () => void;
  onLoadExample: () => void;
  onClear: () => void;
}

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const authTypes: AuthType[] = ['None', 'Bearer Token', 'API Key', 'Basic Auth'];

export function InputPanel({
  form,
  errors,
  onChange,
  onGenerate,
  onLoadExample,
  onClear,
}: InputPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">Endpoint Details</h2>
        <p className="mt-1 text-sm text-slate-600">Enter the API contract details and the rules engine will build a QA-ready test set.</p>
      </div>

      <div className="space-y-5 px-5 py-5">
        {errors.length > 0 ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="API name / feature name">
            <input
              className={fieldClass}
              value={form.apiName}
              onChange={(event) => onChange('apiName', event.target.value)}
              placeholder="Create Customer"
            />
          </FormField>

          <FormField label="Endpoint URL/path">
            <input
              className={fieldClass}
              value={form.endpoint}
              onChange={(event) => onChange('endpoint', event.target.value)}
              placeholder="/api/v1/customers"
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="HTTP method">
            <select className={fieldClass} value={form.method} onChange={(event) => onChange('method', event.target.value)}>
              {methods.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Authentication type">
            <select className={fieldClass} value={form.authType} onChange={(event) => onChange('authType', event.target.value)}>
              {authTypes.map((authType) => (
                <option key={authType}>{authType}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Expected status code">
            <input
              className={fieldClass}
              value={form.expectedStatusCode}
              onChange={(event) => onChange('expectedStatusCode', event.target.value)}
              placeholder="200, 201, 204"
              inputMode="numeric"
            />
          </FormField>
        </div>

        <FormField label="Headers" helper="Use JSON object syntax or key: value lines. Optional.">
          <textarea
            className={`${fieldClass} min-h-24`}
            value={form.headers}
            onChange={(event) => onChange('headers', event.target.value)}
            placeholder="Content-Type: application/json"
          />
        </FormField>

        <FormField label="Request body JSON" helper="Optional for GET and DELETE. Field names and data types drive validation cases.">
          <textarea
            className={`${fieldClass} min-h-44 font-mono`}
            value={form.requestBody}
            onChange={(event) => onChange('requestBody', event.target.value)}
            placeholder={'{\n  "email": "user@example.com"\n}'}
            spellCheck={false}
          />
        </FormField>

        <FormField label="Expected response body / schema" helper="Optional. When provided, schema and data validation cases are generated.">
          <textarea
            className={`${fieldClass} min-h-36 font-mono`}
            value={form.expectedResponse}
            onChange={(event) => onChange('expectedResponse', event.target.value)}
            placeholder={'{\n  "id": "123",\n  "status": "active"\n}'}
            spellCheck={false}
          />
        </FormField>

        <FormField label="Business rules / notes">
          <textarea
            className={`${fieldClass} min-h-28`}
            value={form.businessRules}
            onChange={(event) => onChange('businessRules', event.target.value)}
            placeholder="Email must be unique. User must have admin role."
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus:ring-2 focus:ring-sky-300"
          type="button"
          onClick={onGenerate}
        >
          <Wand2 size={18} aria-hidden="true" />
          Generate test cases
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          type="button"
          onClick={onLoadExample}
        >
          <ClipboardList size={18} aria-hidden="true" />
          Load example
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          type="button"
          onClick={onClear}
        >
          <Eraser size={18} aria-hidden="true" />
          Clear form
        </button>
      </div>
    </section>
  );
}
