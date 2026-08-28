import type { Project } from './types';

export const sampleProject: Project = {
  id: 'sample-page-42',
  name: 'Transit access survey',
  sourcePage: 'Community mobility report, p. 42',
  image: '/sample-table.svg',
  updatedAt: new Date().toISOString(),
  checkpoints: [],
  cells: [
    { id: 'c1', text: 'Route', row: 1, col: 1, role: 'columnheader', box: { x: 8, y: 13, width: 26, height: 15 } },
    { id: 'c2', text: 'Step-free stops', row: 1, col: 2, role: 'columnheader', box: { x: 34, y: 13, width: 31, height: 15 } },
    { id: 'c3', text: 'Audio notices', row: 1, col: 3, role: 'columnheader', box: { x: 65, y: 13, width: 27, height: 15 } },
    { id: 'c4', text: 'River', row: 2, col: 1, role: 'rowheader', box: { x: 8, y: 28, width: 26, height: 18 } },
    { id: 'c6', text: 'Yes', row: 2, col: 3, role: 'data', box: { x: 65, y: 28, width: 27, height: 18 } },
    { id: 'c5', text: '12 of 14', row: 2, col: 2, role: 'data', box: { x: 34, y: 28, width: 31, height: 18 } },
    { id: 'c7', text: 'Hill', row: 3, col: 1, role: 'rowheader', box: { x: 8, y: 46, width: 26, height: 18 } },
    { id: 'c8', text: '8 of 11', row: 3, col: 2, role: 'data', box: { x: 34, y: 46, width: 31, height: 18 } },
    { id: 'c9', text: 'No', row: 3, col: 3, role: 'data', box: { x: 65, y: 46, width: 27, height: 18 } },
  ],
};
