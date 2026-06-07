import { TestCase } from '../types/api';

export function toMarkdown(testCases: TestCase[]): string {
  return testCases
    .map((testCase) => {
      return [
        `## ${testCase.id} - ${testCase.title}`,
        '',
        `- Category: ${testCase.category}`,
        `- Priority: ${testCase.priority}`,
        `- Preconditions: ${testCase.preconditions}`,
        '- Steps:',
        ...testCase.steps.map((step, index) => `  ${index + 1}. ${step}`),
        `- Expected result: ${testCase.expectedResult}`,
      ].join('\n');
    })
    .join('\n\n');
}

export function toCsv(testCases: TestCase[]): string {
  const headers = ['ID', 'Category', 'Title', 'Preconditions', 'Steps', 'Expected Result', 'Priority'];
  const rows = testCases.map((testCase) => [
    testCase.id,
    testCase.category,
    testCase.title,
    testCase.preconditions,
    testCase.steps.join(' | '),
    testCase.expectedResult,
    testCase.priority,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
}

export function downloadCsv(csv: string, fileName: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
