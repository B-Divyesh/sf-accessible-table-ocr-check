import type { Box, Cell, CellRole, Project, ReviewIssue } from './types';

export const MAX_CELLS = 500;
export const MAX_GRID_DIMENSION = 99;

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

const finitePositive = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export function boundedGridCoordinate(value: unknown, label = 'Grid coordinate', fallback = 1): number {
  const normalized = Math.max(1, Math.round(finitePositive(value, fallback)));
  if (normalized > MAX_GRID_DIMENSION) {
    throw new Error(`${label} ${normalized} is outside the supported 1–${MAX_GRID_DIMENSION} range. Correct the position and try again.`);
  }
  return normalized;
}

export function assertBoundedGrid(cells: Cell[]): void {
  if (cells.length > MAX_CELLS) throw new Error(`A table check can contain at most ${MAX_CELLS} cells.`);
  for (const [index, cell] of cells.entries()) {
    for (const [axis, value] of [['row', cell.row], ['column', cell.col]] as const) {
      if (!Number.isInteger(value) || value < 1 || value > MAX_GRID_DIMENSION) {
        throw new Error(`Cell ${index + 1} has ${axis} ${String(value)}, outside the supported 1–${MAX_GRID_DIMENSION} range.`);
      }
    }
  }
}

export function repairPersistedGrid(project: Project): { project: Project; repaired: boolean } {
  let repaired = false;
  const repairCells = (cells: Cell[]) => cells.slice(0, MAX_CELLS).map((cell) => {
    const repair = (value: unknown) => {
      const parsed = Number(value);
      const normalized = Number.isFinite(parsed) ? Math.min(MAX_GRID_DIMENSION, Math.max(1, Math.round(parsed))) : 1;
      if (normalized !== value) repaired = true;
      return normalized;
    };
    return { ...cell, row: repair(cell.row), col: repair(cell.col) };
  });
  if (project.cells.length > MAX_CELLS) repaired = true;
  const checkpoints = project.checkpoints.map((checkpoint) => {
    if (checkpoint.cells.length > MAX_CELLS) repaired = true;
    return { ...checkpoint, cells: repairCells(checkpoint.cells) };
  });
  return { project: { ...project, cells: repairCells(project.cells), checkpoints }, repaired };
}

export function nextAvailableGridPosition(cells: Cell[]): { row: number; col: number } {
  assertBoundedGrid(cells);
  const occupied = new Set(cells.map((cell) => `${cell.row}:${cell.col}`));
  const preferredRow = Math.max(1, ...cells.map((cell) => cell.row));
  for (let col = 1; col <= MAX_GRID_DIMENSION; col++) {
    if (!occupied.has(`${preferredRow}:${col}`)) return { row: preferredRow, col };
  }
  for (let row = 1; row <= MAX_GRID_DIMENSION; row++) {
    for (let col = 1; col <= MAX_GRID_DIMENSION; col++) {
      if (!occupied.has(`${row}:${col}`)) return { row, col };
    }
  }
  throw new Error(`The ${MAX_GRID_DIMENSION} × ${MAX_GRID_DIMENSION} grid is full.`);
}

const normalizedBox = (raw: Record<string, unknown>, index: number, pageWidth = 1, pageHeight = 1): Box => {
  const candidate = raw.bbox ?? raw.boundingBox ?? raw.box;
  const values: Record<string, unknown> = Array.isArray(candidate)
    ? { x: candidate[0], y: candidate[1], width: Number(candidate[2]) - Number(candidate[0]), height: Number(candidate[3]) - Number(candidate[1]) }
    : (candidate && typeof candidate === 'object' ? candidate : raw) as Record<string, unknown>;
  const x = finitePositive(values.x ?? values.left, (index % 4) * 22 + 6);
  const y = finitePositive(values.y ?? values.top, Math.floor(index / 4) * 14 + 8);
  const width = finitePositive(values.width ?? values.w, 20);
  const height = finitePositive(values.height ?? values.h, 10);
  const convert = (value: number, extent: number) => value <= 1 ? value * 100 : extent > 1 ? value / extent * 100 : Math.min(value, 100);
  return {
    x: Math.max(0, Math.min(98, convert(x, pageWidth))),
    y: Math.max(0, Math.min(98, convert(y, pageHeight))),
    width: Math.max(2, Math.min(100, convert(width, pageWidth))),
    height: Math.max(2, Math.min(100, convert(height, pageHeight))),
  };
};

export function parseOcrJson(text: string): { cells: Cell[]; sourcePage: string } {
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error('This is not valid JSON. Export OCR results as JSON and try again.'); }
  if (!data || typeof data !== 'object') throw new Error('The OCR file must contain a JSON object.');
  const root = data as Record<string, unknown>;
  const pages = Array.isArray(root.pages) ? root.pages : [];
  const firstPage = (pages[0] && typeof pages[0] === 'object' ? pages[0] : {}) as Record<string, unknown>;
  const candidates = root.cells ?? root.blocks ?? firstPage.cells ?? firstPage.blocks;
  if (!Array.isArray(candidates) || candidates.length === 0) throw new Error('No cells or blocks were found. Use a “cells” or “blocks” array.');
  if (candidates.length > MAX_CELLS) throw new Error(`This page has more than ${MAX_CELLS} blocks. Split it into one table per review.`);
  const pageWidth = finitePositive(root.width ?? firstPage.width, 1);
  const pageHeight = finitePositive(root.height ?? firstPage.height, 1);
  const cells = candidates.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Block ${index + 1} is not an object.`);
    const raw = item as Record<string, unknown>;
    const textValue = raw.text ?? raw.value ?? raw.content ?? '';
    const roleValue = String(raw.role ?? raw.type ?? 'data').toLowerCase();
    const role: CellRole = roleValue.includes('column') || roleValue === 'header' ? 'columnheader' : roleValue.includes('row') ? 'rowheader' : 'data';
    return {
      id: String(raw.id ?? `cell-${crypto.randomUUID()}`),
      text: String(textValue),
      row: boundedGridCoordinate(raw.row ?? raw.rowIndex, `Block ${index + 1} row`, Math.floor(index / 4) + 1),
      col: boundedGridCoordinate(raw.col ?? raw.column ?? raw.columnIndex, `Block ${index + 1} column`, index % 4 + 1),
      role,
      box: normalizedBox(raw, index, pageWidth, pageHeight),
      order: finitePositive(raw.order ?? raw.readingOrder, index + 1),
    };
  }).sort((a, b) => a.order - b.order).map(({ id, text: cellText, row, col, role: cellRole, box }) => ({ id, text: cellText, row, col, role: cellRole, box }));
  return { cells, sourcePage: String(root.sourcePage ?? root.page ?? firstPage.page ?? 'Imported OCR page') };
}

export function reviewIssues(cells: Cell[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const seen = new Map<string, string>();
  cells.forEach((cell, index) => {
    if (!cell.text.trim()) issues.push({ id: `blank-${cell.id}`, severity: 'error', cellId: cell.id, message: `Cell ${index + 1} is blank.`, fix: 'Enter the missing text or remove the cell.' });
    const key = `${cell.row}:${cell.col}`;
    if (seen.has(key)) issues.push({ id: `duplicate-${cell.id}`, severity: 'error', cellId: cell.id, message: `Two cells occupy row ${cell.row}, column ${cell.col}.`, fix: 'Correct one cell’s row or column.' });
    else seen.set(key, cell.id);
  });
  const expected = [...cells].sort((a, b) => a.row - b.row || a.col - b.col);
  cells.forEach((cell, index) => {
    if (expected[index]?.id !== cell.id) issues.push({ id: `order-${cell.id}`, severity: 'error', cellId: cell.id, message: `Reading order ${index + 1} jumps to row ${cell.row}, column ${cell.col}.`, fix: 'Move the cell until order follows rows from left to right.' });
  });
  if (!cells.some((cell) => cell.role === 'columnheader')) issues.push({ id: 'no-column-header', severity: 'warning', message: 'No column headers are marked.', fix: 'Label heading cells so screen readers can announce them.' });
  if (cells.length && !cells.some((cell) => cell.role === 'rowheader')) issues.push({ id: 'no-row-header', severity: 'warning', message: 'No row headers are marked.', fix: 'If the first column names rows, relabel those cells as row headers.' });
  return issues;
}

export function tableMatrix(cells: Cell[]) {
  assertBoundedGrid(cells);
  const maxRow = Math.max(1, ...cells.map((cell) => cell.row));
  const maxCol = Math.max(1, ...cells.map((cell) => cell.col));
  const byPosition = new Map(cells.map((cell) => [`${cell.row}:${cell.col}`, cell]));
  return Array.from({ length: maxRow }, (_, row) => Array.from({ length: maxCol }, (_, col) => byPosition.get(`${row + 1}:${col + 1}`)));
}

export function accessibleHtml(project: Project): string {
  const matrix = tableMatrix(project.cells);
  const headerRows = new Set(project.cells.filter((cell) => cell.role === 'columnheader').map((cell) => cell.row));
  const renderRow = (row: Array<Cell | undefined>) => `<tr>\n${row.map((cell) => {
    if (!cell) return '      <td></td>';
    if (cell.role === 'columnheader') return `      <th scope="col">${escapeHtml(cell.text)}</th>`;
    if (cell.role === 'rowheader') return `      <th scope="row">${escapeHtml(cell.text)}</th>`;
    return `      <td>${escapeHtml(cell.text)}</td>`;
  }).join('\n')}\n    </tr>`;
  const head = matrix.filter((_, index) => headerRows.has(index + 1));
  const body = matrix.filter((_, index) => !headerRows.has(index + 1));
  return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>${escapeHtml(project.name)} — accessible table</title>\n</head>\n<body>\n  <main>\n    <h1>${escapeHtml(project.name)}</h1>\n    <p>Source: ${escapeHtml(project.sourcePage)}</p>\n    <table>\n      <caption>${escapeHtml(project.name)}. Source: ${escapeHtml(project.sourcePage)}</caption>\n${head.length ? `      <thead>\n${head.map(renderRow).join('\n')}\n      </thead>\n` : ''}      <tbody>\n${body.map(renderRow).join('\n')}\n      </tbody>\n    </table>\n  </main>\n</body>\n</html>\n`;
}

const csvValue = (value: string) => /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

export function csvExport(project: Project): string {
  return tableMatrix(project.cells).map((row) => row.map((cell) => csvValue(cell?.text ?? '')).join(',')).join('\r\n') + '\r\n';
}

export function issueReport(project: Project): string {
  const issues = reviewIssues(project.cells);
  return [`ACCESSIBLE TABLE OCR CHECK`, `Project: ${project.name}`, `Source: ${project.sourcePage}`, `Reviewed: ${new Date().toISOString()}`, `Cells: ${project.cells.length}`, `Open issues: ${issues.length}`, '', ...(issues.length ? issues.flatMap((issue, index) => [`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`, `   Suggested fix: ${issue.fix}`]) : ['No automated reading-order or structure issues remain.']), '', 'Note: A human reviewer should still compare every value with the source image.'].join('\n');
}
