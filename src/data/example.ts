import { ApiFormData } from '../types/api';

export const emptyForm: ApiFormData = {
  apiName: '',
  method: 'POST',
  endpoint: '',
  authType: 'Bearer Token',
  headers: '',
  requestBody: '',
  expectedStatusCode: '',
  expectedResponse: '',
  businessRules: '',
};

export const exampleForm: ApiFormData = {
  apiName: 'Create Customer',
  method: 'POST',
  endpoint: '/api/v1/customers',
  authType: 'Bearer Token',
  headers: `Content-Type: application/json
Accept: application/json`,
  requestBody: JSON.stringify(
    {
      name: 'Jane Cooper',
      email: 'jane.cooper@example.com',
      age: 34,
      phone: '+1-555-0149',
      address: {
        line1: '200 Market Street',
        city: 'Denver',
        zipCode: '80202',
      },
    },
    null,
    2,
  ),
  expectedStatusCode: '201',
  expectedResponse: JSON.stringify(
    {
      id: 'cus_12345',
      name: 'Jane Cooper',
      email: 'jane.cooper@example.com',
      status: 'active',
      createdAt: '2026-06-07T10:00:00Z',
    },
    null,
    2,
  ),
  businessRules:
    'Email must be unique. Customer age must be 18 or older. Phone number is optional but must be valid when provided.',
};
