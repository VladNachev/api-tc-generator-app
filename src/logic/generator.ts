import { ApiFormData, ParsedField, TestCase, TestCaseCategory, Priority } from '../types/api';
import { extractFields, parseHeaders, parseOptionalJson } from './parser';

type DraftCase = Omit<TestCase, 'id'>;

const categoryOrder: TestCaseCategory[] = [
  'Positive scenarios',
  'Negative scenarios',
  'Field validation',
  'Authentication & authorization',
  'Headers & content type',
  'Response validation',
  'Security checks',
  'Basic performance checks',
];

export function generateTestCases(form: ApiFormData): TestCase[] {
  const requestBody = parseOptionalJson(form.requestBody).data;
  const expectedResponse = parseOptionalJson(form.expectedResponse).data;
  const fields = extractFields(requestBody);
  const headers = parseHeaders(form.headers).headers;
  const feature = form.apiName.trim() || 'API endpoint';
  const endpoint = form.endpoint.trim() || 'the endpoint';
  const statusCode = form.expectedStatusCode.trim() || 'the expected status code';
  const cases: DraftCase[] = [];

  cases.push(...positiveScenarios(form, feature, endpoint, statusCode));
  cases.push(...negativeScenarios(form, endpoint));
  cases.push(...fieldValidationScenarios(fields, form.method));
  cases.push(...authScenarios(form.authType, endpoint));
  cases.push(...headerScenarios(headers, form.method));
  cases.push(...responseScenarios(Boolean(expectedResponse), statusCode));
  cases.push(...securityScenarios(endpoint, fields));
  cases.push(...performanceScenarios(endpoint));

  if (form.businessRules.trim()) {
    cases.push({
      category: 'Positive scenarios',
      title: 'Verify endpoint behavior against documented business rules',
      preconditions: 'Business rules or notes are available in the input.',
      steps: [
        `Review the rule notes: ${form.businessRules.trim()}`,
        `Send a valid ${form.method} request to ${endpoint}.`,
        'Compare the response and side effects with each listed business rule.',
      ],
      expectedResult: 'The API follows every stated business rule without conflicting behavior.',
      priority: 'High',
    });
  }

  return cases
    .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
    .map((testCase, index) => ({
      id: `TC-${String(index + 1).padStart(3, '0')}`,
      ...testCase,
    }));
}

function positiveScenarios(
  form: ApiFormData,
  feature: string,
  endpoint: string,
  statusCode: string,
): DraftCase[] {
  const actionByMethod: Record<ApiFormData['method'], string> = {
    GET: 'retrieve data',
    POST: 'create a resource',
    PUT: 'replace an existing resource',
    PATCH: 'partially update an existing resource',
    DELETE: 'delete an existing resource',
  };

  const cases: DraftCase[] = [
    {
      category: 'Positive scenarios',
      title: `Verify ${feature} can ${actionByMethod[form.method]}`,
      preconditions: 'A valid request, required data, and required permissions are available.',
      steps: [
        `Prepare a valid ${form.method} request for ${endpoint}.`,
        'Include all required headers, authentication, and request payload values.',
        'Submit the request.',
      ],
      expectedResult: `The API returns ${statusCode} and completes the expected ${form.method} operation.`,
      priority: 'High',
    },
  ];

  if (form.method === 'POST') {
    cases.push(methodCase('Positive scenarios', 'Verify resource creation with minimum required fields', form, endpoint, 'The resource is created and the response contains its identifier.', 'High'));
  }

  if (form.method === 'PUT' || form.method === 'PATCH') {
    cases.push(methodCase('Positive scenarios', `Verify ${form.method === 'PUT' ? 'full' : 'partial'} resource update`, form, endpoint, 'The resource is updated and returned values match the submitted changes.', 'High'));
  }

  if (form.method === 'DELETE') {
    cases.push(methodCase('Positive scenarios', 'Verify resource deletion for an existing item', form, endpoint, 'The resource is removed or marked deleted according to the API contract.', 'High'));
  }

  return cases;
}

function negativeScenarios(form: ApiFormData, endpoint: string): DraftCase[] {
  const cases: DraftCase[] = [
    {
      category: 'Negative scenarios',
      title: 'Verify request to an invalid endpoint path',
      preconditions: 'The API service is available.',
      steps: [
        `Change ${endpoint} to a non-existing path.`,
        `Send the ${form.method} request.`,
      ],
      expectedResult: 'The API returns a clear 404-style response without exposing internal implementation details.',
      priority: 'Medium',
    },
    {
      category: 'Negative scenarios',
      title: 'Verify unsupported HTTP method is rejected',
      preconditions: 'The endpoint is available.',
      steps: [
        `Send an unsupported method request to ${endpoint}.`,
        'Observe the response status and error body.',
      ],
      expectedResult: 'The API rejects the request with a 405-style response or documented method error.',
      priority: 'Medium',
    },
  ];

  if (['POST', 'PUT', 'PATCH'].includes(form.method)) {
    cases.push({
      category: 'Negative scenarios',
      title: 'Verify malformed JSON request body is rejected',
      preconditions: 'The endpoint accepts a JSON request body.',
      steps: [
        'Prepare a request body with broken JSON syntax.',
        `Send the ${form.method} request.`,
      ],
      expectedResult: 'The API returns a validation error and does not create or update data.',
      priority: 'High',
    });
  }

  return cases;
}

function fieldValidationScenarios(fields: ParsedField[], method: ApiFormData['method']): DraftCase[] {
  if (fields.length === 0) {
    return [
      {
        category: 'Field validation',
        title: 'Verify endpoint behavior when optional body is omitted',
        preconditions: 'The endpoint contract allows an empty or absent request body.',
        steps: [`Send a ${method} request without a request body.`],
        expectedResult: 'The API accepts or rejects the request according to the documented contract with a clear response.',
        priority: 'Medium',
      },
    ];
  }

  const cases: DraftCase[] = [];
  const stringFields = fields.filter((field) => field.type === 'string').slice(0, 4);
  const numberFields = fields.filter((field) => field.type === 'number').slice(0, 4);
  const requiredFields = fields.filter((field) => field.requiredLooking).slice(0, 5);
  const emailFields = fields.filter((field) => field.emailLike).slice(0, 3);

  stringFields.forEach((field) => {
    cases.push(fieldCase(field.path, 'empty string value', 'Set the field to "".', 'The API returns a field-level validation message.', 'Medium'));
    cases.push(fieldCase(field.path, 'very long string value', 'Set the field to a string longer than the expected max length.', 'The API rejects the value or truncates only if documented.', 'Medium'));
    cases.push(fieldCase(field.path, 'special characters', 'Set the field to symbols, quotes, and script-like text.', 'The API handles special characters safely and validates according to contract.', 'Medium'));
    cases.push(fieldCase(field.path, 'wrong data type', 'Send a number or object instead of a string.', 'The API returns a type validation error.', 'High'));
  });

  emailFields.forEach((field) => {
    cases.push(fieldCase(field.path, 'invalid email format', 'Send a value such as user-at-example.', 'The API rejects the invalid email format.', 'High'));
  });

  numberFields.forEach((field) => {
    ['negative number', 'decimal value', 'very large number', 'null value', 'string instead of number'].forEach((variant) => {
      cases.push(fieldCase(field.path, variant, `Set the field to a ${variant}.`, 'The API validates numeric boundaries and data type according to the contract.', variant === 'string instead of number' ? 'High' : 'Medium'));
    });
  });

  requiredFields.forEach((field) => {
    cases.push(fieldCase(field.path, 'missing required-looking field', 'Remove the field from the request body.', 'The API returns a clear missing-field validation message.', 'High'));
    cases.push(fieldCase(field.path, 'null required-looking field', 'Set the field value to null.', 'The API rejects null unless null is explicitly allowed.', 'High'));
  });

  return cases;
}

function authScenarios(authType: ApiFormData['authType'], endpoint: string): DraftCase[] {
  if (authType === 'None') {
    return [
      {
        category: 'Authentication & authorization',
        title: 'Verify endpoint access without authentication',
        preconditions: 'The endpoint is documented as public or unauthenticated.',
        steps: [`Send a request to ${endpoint} without authentication credentials.`],
        expectedResult: 'The API allows public access or returns a documented authentication error.',
        priority: 'Medium',
      },
    ];
  }

  const authCases: DraftCase[] = [
    authCase('Verify missing authentication credentials are rejected', endpoint, 'Remove all authentication credentials.', 'The API returns 401 or the documented missing-auth response.', 'High'),
    authCase('Verify invalid authentication credentials are rejected', endpoint, 'Use a malformed or fake credential.', 'The API returns 401 and does not process the request.', 'High'),
    authCase('Verify insufficient permissions are rejected', endpoint, 'Use valid credentials for a user without permission.', 'The API returns 403 or the documented authorization error.', 'High'),
  ];

  if (authType === 'Bearer Token') {
    authCases.splice(2, 0, authCase('Verify expired bearer token is rejected', endpoint, 'Use an expired bearer token.', 'The API returns a token-expired or unauthorized response.', 'High'));
  }

  if (authType === 'API Key') {
    authCases.push(authCase('Verify revoked API key is rejected', endpoint, 'Use a revoked or disabled API key.', 'The API rejects the request and does not expose protected data.', 'High'));
  }

  if (authType === 'Basic Auth') {
    authCases.push(authCase('Verify incorrect password is rejected', endpoint, 'Use a valid username with an incorrect password.', 'The API rejects the request without revealing which credential is incorrect.', 'High'));
  }

  return authCases;
}

function headerScenarios(headers: Record<string, string>, method: ApiFormData['method']): DraftCase[] {
  const cases: DraftCase[] = [
    {
      category: 'Headers & content type',
      title: 'Verify missing required headers are handled',
      preconditions: 'The API has documented or expected headers.',
      steps: ['Remove one expected header from the request.', `Send the ${method} request.`],
      expectedResult: 'The API returns a clear error or handles the missing header according to the contract.',
      priority: 'Medium',
    },
  ];

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    cases.push({
      category: 'Headers & content type',
      title: 'Verify unsupported Content-Type is rejected',
      preconditions: 'The endpoint expects JSON payloads.',
      steps: ['Set Content-Type to text/plain.', `Send a valid ${method} request body.`],
      expectedResult: 'The API rejects the request with a documented media type or validation response.',
      priority: 'High',
    });
  }

  if (Object.keys(headers).some((header) => header.toLowerCase() === 'accept')) {
    cases.push({
      category: 'Headers & content type',
      title: 'Verify Accept header response format',
      preconditions: 'The request includes an Accept header.',
      steps: ['Send the request with the configured Accept header.', 'Inspect the response format.'],
      expectedResult: 'The response format matches the requested and documented media type.',
      priority: 'Low',
    });
  }

  return cases;
}

function responseScenarios(hasExpectedResponse: boolean, statusCode: string): DraftCase[] {
  const cases: DraftCase[] = [
    {
      category: 'Response validation',
      title: 'Verify expected status code',
      preconditions: 'A valid request is available.',
      steps: ['Send the request.', 'Capture the HTTP status code.'],
      expectedResult: `The status code is ${statusCode}.`,
      priority: 'High',
    },
  ];

  if (hasExpectedResponse) {
    cases.push(
      {
        category: 'Response validation',
        title: 'Verify response body schema',
        preconditions: 'Expected response body or schema was provided.',
        steps: ['Send a valid request.', 'Compare response keys and data types with the expected response.'],
        expectedResult: 'The response schema matches the expected contract.',
        priority: 'High',
      },
      {
        category: 'Response validation',
        title: 'Verify response data accuracy',
        preconditions: 'Known valid request data is available.',
        steps: ['Send a valid request.', 'Compare important response values with request data and stored records.'],
        expectedResult: 'Returned values are accurate, consistent, and not stale.',
        priority: 'High',
      },
    );
  }

  return cases;
}

function securityScenarios(endpoint: string, fields: ParsedField[]): DraftCase[] {
  const cases: DraftCase[] = [
    {
      category: 'Security checks',
      title: 'Verify sensitive data is not exposed in response',
      preconditions: 'A valid request can be sent.',
      steps: [`Send a valid request to ${endpoint}.`, 'Inspect the response body and headers.'],
      expectedResult: 'Secrets, tokens, passwords, stack traces, and internal IDs are not exposed unless documented.',
      priority: 'High',
    },
    {
      category: 'Security checks',
      title: 'Verify injection-style input is handled safely',
      preconditions: 'The endpoint accepts user-controlled input.',
      steps: ['Send SQL-like, script-like, and command-like payload values.', 'Inspect response behavior.'],
      expectedResult: 'The API validates or sanitizes input and does not execute injected content.',
      priority: 'High',
    },
  ];

  if (fields.some((field) => /password|token|secret|key/i.test(field.path))) {
    cases.push({
      category: 'Security checks',
      title: 'Verify credential-like fields are protected',
      preconditions: 'The request or response includes credential-like fields.',
      steps: ['Send a valid request.', 'Inspect logs, response body, and error messages where accessible.'],
      expectedResult: 'Credential-like values are masked, omitted, or handled according to security requirements.',
      priority: 'High',
    });
  }

  return cases;
}

function performanceScenarios(endpoint: string): DraftCase[] {
  return [
    {
      category: 'Basic performance checks',
      title: 'Verify response time for a single valid request',
      preconditions: 'The API environment is available and stable.',
      steps: [`Send a valid request to ${endpoint}.`, 'Measure the response time.'],
      expectedResult: 'The response time is within the agreed threshold, for example under 2 seconds.',
      priority: 'Medium',
    },
    {
      category: 'Basic performance checks',
      title: 'Verify behavior under repeated requests',
      preconditions: 'A safe test environment and test data are available.',
      steps: ['Send a small burst of repeated valid requests.', 'Monitor status codes and response times.'],
      expectedResult: 'The API remains stable, avoids unexpected errors, and responds consistently.',
      priority: 'Low',
    },
  ];
}

function methodCase(
  category: TestCaseCategory,
  title: string,
  form: ApiFormData,
  endpoint: string,
  expectedResult: string,
  priority: Priority,
): DraftCase {
  return {
    category,
    title,
    preconditions: 'Valid test data and required access are available.',
    steps: [
      `Prepare a valid ${form.method} request for ${endpoint}.`,
      'Submit the request.',
      'Verify the response and resulting resource state.',
    ],
    expectedResult,
    priority,
  };
}

function fieldCase(path: string, variant: string, mutationStep: string, expectedResult: string, priority: Priority): DraftCase {
  return {
    category: 'Field validation',
    title: `Verify ${path} with ${variant}`,
    preconditions: 'A valid baseline request body is available.',
    steps: [
      `Modify only the "${path}" field.`,
      mutationStep,
      'Submit the request.',
    ],
    expectedResult,
    priority,
  };
}

function authCase(title: string, endpoint: string, credentialStep: string, expectedResult: string, priority: Priority): DraftCase {
  return {
    category: 'Authentication & authorization',
    title,
    preconditions: 'The endpoint requires authentication or authorization.',
    steps: [
      credentialStep,
      `Send a request to ${endpoint}.`,
    ],
    expectedResult,
    priority,
  };
}
