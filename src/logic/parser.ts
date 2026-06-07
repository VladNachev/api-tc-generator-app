import { ApiFormData, ParsedField } from '../types/api';

const requiredNamePattern = /(id|name|email|username|password|title|type|status|amount|quantity|date|phone|address)$/i;
const emailNamePattern = /(^|\.|_|\b)(email|emailAddress|userEmail)(\b|$)/i;

export function parseOptionalJson(value: string): { data?: unknown; error?: string } {
  if (!value.trim()) {
    return {};
  }

  try {
    return { data: JSON.parse(value) };
  } catch {
    return { error: 'This JSON is not valid yet. Check quotes, commas, and brackets.' };
  }
}

export function validateFormJson(form: ApiFormData): string[] {
  const errors: string[] = [];
  const requestBody = parseOptionalJson(form.requestBody);
  const expectedResponse = parseOptionalJson(form.expectedResponse);
  const headers = parseHeaders(form.headers);

  if (requestBody.error) {
    errors.push(`Request body: ${requestBody.error}`);
  }

  if (expectedResponse.error) {
    errors.push(`Expected response: ${expectedResponse.error}`);
  }

  if (headers.error) {
    errors.push(headers.error);
  }

  return errors;
}

export function parseHeaders(value: string): { headers: Record<string, string>; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { headers: {} };
  }

  if (trimmed.startsWith('{')) {
    const parsed = parseOptionalJson(trimmed);
    if (parsed.error || typeof parsed.data !== 'object' || parsed.data === null || Array.isArray(parsed.data)) {
      return { headers: {}, error: 'Headers must be valid JSON object syntax or key: value lines.' };
    }

    return { headers: parsed.data as Record<string, string> };
  }

  const headers: Record<string, string> = {};
  const invalidLine = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !line.includes(':'));

  if (invalidLine) {
    return { headers: {}, error: `Header line "${invalidLine}" should use key: value format.` };
  }

  trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(':');
      headers[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim();
    });

  return { headers };
}

export function extractFields(data: unknown, parentPath = ''): ParsedField[] {
  if (data === null || typeof data !== 'object') {
    return [];
  }

  if (Array.isArray(data)) {
    return data.flatMap((item, index) => extractFields(item, `${parentPath}[${index}]`));
  }

  return Object.entries(data as Record<string, unknown>).flatMap(([key, value]) => {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const type = getType(value);
    const field: ParsedField = {
      path,
      type,
      requiredLooking: requiredNamePattern.test(key) || !key.toLowerCase().includes('optional'),
      emailLike: emailNamePattern.test(key),
    };

    if (type === 'object' || type === 'array') {
      return [field, ...extractFields(value, path)];
    }

    return [field];
  });
}

function getType(value: unknown): ParsedField['type'] {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'object') {
    return 'object';
  }

  return 'string';
}
