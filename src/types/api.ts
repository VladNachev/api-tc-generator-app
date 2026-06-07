export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type AuthType = 'None' | 'Bearer Token' | 'API Key' | 'Basic Auth';

export type Priority = 'High' | 'Medium' | 'Low';

export type TestCaseCategory =
  | 'Positive scenarios'
  | 'Negative scenarios'
  | 'Field validation'
  | 'Authentication & authorization'
  | 'Headers & content type'
  | 'Response validation'
  | 'Security checks'
  | 'Basic performance checks';

export interface ApiFormData {
  apiName: string;
  method: HttpMethod;
  endpoint: string;
  authType: AuthType;
  headers: string;
  requestBody: string;
  expectedStatusCode: string;
  expectedResponse: string;
  businessRules: string;
}

export interface ParsedField {
  path: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  requiredLooking: boolean;
  emailLike: boolean;
}

export interface TestCase {
  id: string;
  category: TestCaseCategory;
  title: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: Priority;
}
