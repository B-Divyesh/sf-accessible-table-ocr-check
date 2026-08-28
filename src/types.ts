export type CellRole = 'data' | 'columnheader' | 'rowheader';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Cell {
  id: string;
  text: string;
  row: number;
  col: number;
  role: CellRole;
  box: Box;
}

export interface Checkpoint {
  id: string;
  name: string;
  createdAt: string;
  cells: Cell[];
}

export interface Project {
  id: string;
  name: string;
  sourcePage: string;
  image: string;
  cells: Cell[];
  updatedAt: string;
  checkpoints: Checkpoint[];
}

export interface ReviewIssue {
  id: string;
  severity: 'error' | 'warning';
  cellId?: string;
  message: string;
  fix: string;
}
