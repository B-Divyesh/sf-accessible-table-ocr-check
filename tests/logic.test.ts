import { describe, expect, it } from 'vitest';
import { accessibleHtml, csvExport, nextAvailableGridPosition, parseOcrJson, repairPersistedGrid, reviewIssues } from '../src/logic';
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

  it('flags order, blank, duplicate-position, and missing-header defects @claim:issue-detection', () => {
    const cells = [
      { ...sampleProject.cells[1], id: 'a', text: '', row: 2, col: 1, role: 'data' as const },
      { ...sampleProject.cells[0], id: 'b', row: 1, col: 1, role: 'data' as const },
      { ...sampleProject.cells[2], id: 'c', row: 2, col: 1, role: 'data' as const },
    ];
    const ids = reviewIssues(cells).map((issue) => issue.id);
    expect(ids.some((id) => id.startsWith('blank-'))).toBe(true);
    expect(ids.some((id) => id.startsWith('duplicate-'))).toBe(true);
    expect(ids.some((id) => id.startsWith('order-'))).toBe(true);
    expect(ids).toContain('no-column-header');
    expect(ids).toContain('no-row-header');
  });

  it.each([
    ['row', { row: 10_000, column: 1 }],
    ['column', { row: 1, column: 100 }],
  ])('rejects an imported %s outside the bounded grid before use', (axis, coordinates) => {
    expect(() => parseOcrJson(JSON.stringify({ cells: [{ text: 'Unsafe', ...coordinates }] })))
      .toThrow(`Block 1 ${axis} ${coordinates[axis as keyof typeof coordinates]} is outside the supported 1–99 range`);
  });

  it('repairs legacy persisted coordinates and checkpoints into the safe grid', () => {
    const unsafe = structuredClone(sampleProject);
    unsafe.cells[0].row = 10_000;
    unsafe.cells[1].col = 100;
    unsafe.checkpoints = [{ id: 'old', name: 'Old', createdAt: '', cells: structuredClone(unsafe.cells) }];
    const repaired = repairPersistedGrid(unsafe);
    expect(repaired.repaired).toBe(true);
    expect(repaired.project.cells[0].row).toBe(99);
    expect(repaired.project.cells[1].col).toBe(99);
    expect(repaired.project.checkpoints[0].cells[0].row).toBe(99);
  });

  it('adds within the grid even when the final row already has 99 occupied columns', () => {
    const cells = Array.from({ length: 99 }, (_, index) => ({ ...sampleProject.cells[0], id: String(index), row: 99, col: index + 1 }));
    expect(nextAvailableGridPosition(cells)).toEqual({ row: 1, col: 1 });
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

  it('refuses forged out-of-range coordinates before allocating an export matrix', () => {
    const unsafe = structuredClone(sampleProject);
    unsafe.cells[0].row = 1_000_000_000;
    expect(() => accessibleHtml(unsafe)).toThrow(/outside the supported 1–99 range/);
    expect(() => csvExport(unsafe)).toThrow(/outside the supported 1–99 range/);
  });
});
