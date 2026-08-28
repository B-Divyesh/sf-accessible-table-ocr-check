import { describe, expect, it } from 'vitest';
import { accessibleHtml, csvExport, parseOcrJson, reviewIssues } from '../src/logic';
import { sampleProject } from '../src/sample';

describe('OCR import and review', () => {
  it('accepts common block JSON and normalizes pixel coordinates', () => {
    const parsed = parseOcrJson(JSON.stringify({ width: 1000, height: 500, page: 'Scan p. 8', blocks: [
      { text: 'Name', row: 1, column: 1, type: 'column_header', bbox: [100, 50, 400, 100], readingOrder: 2 },
      { text: 'Value', row: 1, column: 2, type: 'header', bbox: [400, 50, 800, 100], readingOrder: 1 },
    ] }));
    expect(parsed.sourcePage).toBe('Scan p. 8');
    expect(parsed.cells[0].text).toBe('Value');
    expect(parsed.cells[1].box.x).toBe(10);
    expect(parsed.cells[1].box.width).toBe(30);
  });

  it('finds every deliberately scrambled sample cell', () => {
    const issues = reviewIssues(sampleProject.cells);
    expect(issues.filter((issue) => issue.id.startsWith('order-')).map((issue) => issue.cellId)).toEqual(['c6', 'c5']);
  });

  it('clears order defects after correction', () => {
    const corrected = [...sampleProject.cells];
    [corrected[4], corrected[5]] = [corrected[5], corrected[4]];
    expect(reviewIssues(corrected)).toEqual([]);
  });
});

describe('accessible exports', () => {
  it('uses semantic scoped headers and retains source reference', () => {
    const html = accessibleHtml(sampleProject);
    expect(html).toContain('<th scope="col">Route</th>');
    expect(html).toContain('<th scope="row">River</th>');
    expect(html).toContain('Community mobility report, p. 42');
  });

  it('creates a rectangular CSV in grid order', () => {
    const rows = csvExport(sampleProject).trim().split('\r\n');
    expect(rows).toHaveLength(3);
    expect(rows[1]).toBe('River,12 of 14,Yes');
  });
});
