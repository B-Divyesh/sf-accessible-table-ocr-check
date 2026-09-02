import './style.css';
import { accessibleHtml, assertBoundedGrid, boundedGridCoordinate, csvExport, issueReport, MAX_CELLS, MAX_GRID_DIMENSION, nextAvailableGridPosition, parseOcrJson, repairPersistedGrid, reviewIssues, tableMatrix } from './logic';
import { sampleProject } from './sample';
import { clearProject, loadProject, saveProject } from './storage';
import type { Cell, Project } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const SLUG = 'accessible-table-ocr-check';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const API_BASE = 'https://api.sociobot.in/api/v1';
const LICENSE_VERIFY_PATH = '/api/license/verify';
const SITE_URL = 'https://accessible-table-ocr-check.sociobot.in';
const BUILD_ID = 'polish-3';
let project: Project | null = null;
let selectedCell = '';
let saveTimer = 0;
let isOffline = !navigator.onLine || sessionStorage.getItem('proof-desk-offline') === 'true';
let licenseActive = false;
let licenseNotice = '';
let productNotice = '';
let demoMode = location.pathname.replace(/\/+$/, '') === '/demo' || new URL(location.href).searchParams.get('demo') === '1';
let focusAfterRender = false;

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);

function setMetadata(title: string, description: string, canonicalPath: string) {
  document.title = title;
  const values: Record<string, string> = {
    'meta[name="description"]': description,
    'meta[property="og:title"]': title,
    'meta[property="og:description"]': description,
    'meta[name="twitter:title"]': title,
    'meta[name="twitter:description"]': description,
  };
  for (const [selector, value] of Object.entries(values)) document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}${canonicalPath}`);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', `${SITE_URL}${canonicalPath}`);
}

function demoBanner() {
  if (!demoMode) return '';
  return `<aside class="demo-banner" aria-label="Demo mode"><b>Demo — sample data, nothing is saved</b><span>Your table checks are kept separate.</span><div><button type="button" data-action="reset-demo">Reset demo</button><button type="button" data-action="start-real">Start for real</button></div></aside>`;
}

function shell(content: string) {
  return `<header class="site-header">
    <a class="wordmark" href="/"><span class="registration" aria-hidden="true">＋</span><span>Table<br><b>proofing desk</b></span></a>
    <nav aria-label="Primary"><a href="/demo">Demo</a><a href="/#how">How it works</a><a href="/privacy/">Privacy</a><a href="/#license">Desk license</a></nav>
    <span class="local-badge"><span aria-hidden="true">●</span> Local by default</span>
  </header>
  ${demoBanner()}
  ${isOffline ? '<div class="offline-banner" role="status">You’re offline. The open table check stays on this device, and exports still work.</div>' : ''}
  ${productNotice ? `<div class="product-notice" role="alert"><b>Check the table.</b> ${escapeHtml(productNotice)}</div>` : ''}
  <main id="main">${content}</main>
  <footer><p><b>Accessible Table OCR Check</b> · Your pages stay in this browser.</p><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-accessible-table-ocr-check" target="_blank" rel="noreferrer">Source on GitHub (opens external site)</a></nav><p class="generated-note">Built by Param Factory · Build ${BUILD_ID} · The proofing-desk artwork was generated for this product.</p></footer>
  <div id="live-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  <div id="update-toast" class="update-toast" hidden><span>A newer proofing desk is ready.</span><button type="button" data-action="reload" aria-label="Update now">Update now</button></div>`;
}

function legalPage(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  setMetadata(`${privacy ? 'Privacy' : 'Terms'} — Accessible Table OCR Check`, privacy ? 'How Accessible Table OCR Check stores documents and handles optional license checks.' : 'Terms for using Accessible Table OCR Check and its optional one-time Desk license.', `/${kind}/`);
  app.innerHTML = shell(`<article class="legal-page"><p class="eyebrow">Plain-language policy · 2 September 2026</p><h1>${privacy ? 'How we handle your documents' : 'Terms of use'}</h1>${privacy ? `
    <h2>What stays local</h2><p>Source images, OCR JSON, corrections, and saved versions stay in browser storage. They are not uploaded to us. Exports are created on your device.</p>
    <h2>License checks</h2><p>If you add an optional Desk license, its token stays in browser storage. The app checks it no more than once each day. Use the checkout link to add a license.</p>
    <h2>Purchase help</h2><p>US$12 one-time purchase.</p><p>Checkout is processed by Dodo Payments, with Sociobot shown as the business.</p><p>Dodo Payments handles order questions and returns.</p>
    <h2>Analytics and deletion</h2><p>There are no analytics, ad trackers, third-party fonts, or runtime scripts. Clear the current table check in the app or clear this site’s browser storage to remove local data.</p>
    <h2>Contact</h2><p>Questions can be filed in the project’s public source repository.</p>` : `
    <h2>Use and responsibility</h2><p>You may use the app to review tables you are permitted to process. Copyright permission remains your responsibility. The tool highlights likely structure defects but cannot guarantee that OCR text or accessibility is correct; a human must compare the export with the source.</p>
    <h2>Desk license</h2><p>A Desk license adds local saved versions on supported devices. Core checking and HTML, CSV, JSON, and issue-report exports remain free. If a license is no longer active, saved versions are unavailable. Free checking and exports remain available.</p><p>US$12 one-time purchase.</p><p>Checkout is processed by Dodo Payments, with Sociobot shown as the business.</p><p>Dodo Payments handles order questions and returns.</p>
    <h2>Availability</h2><p>The software is provided under the MIT License without warranty. Keep your own copies of important source material and exports.</p>`}<p><a class="text-link" href="/">← Return to the proofing desk</a></p></article>`);
}

function landing() {
  setMetadata('Accessible Table OCR Check — fix reading order', 'Compare scanned-table OCR with the page, correct reading order and headers, then export an accessible table.', '/');
  app.innerHTML = shell(`<section class="hero">
    <div class="hero-copy"><p class="eyebrow">For scanned-table accessibility checks</p><h1>Fix a scanned table’s<br><em>reading order.</em></h1><p class="lede">For librarians and accessibility reviewers who compare OCR with a scan before sharing a table with screen-reader users.</p>
      <div class="hero-actions"><a class="button primary" href="/demo" data-action="sample">Try it with sample data <span aria-hidden="true">→</span></a><a class="button quiet" href="#import">Import your page</a></div><p class="action-note">Opens a scanned transit table with two reading-order errors.</p>
      <ul class="trust-list" aria-label="Product facts"><li>No document upload</li><li>Works offline after first visit</li><li>Core checking and exports are free</li></ul>
    </div>
    <figure class="hero-art"><picture><source media="(max-width: 620px)" srcset="/assets/proofing-table-640.webp" width="640" height="427"><img src="/assets/proofing-table.webp" width="1280" height="853" sizes="(max-width: 620px) 125vw, (max-width: 900px) 115vw, 67vw" alt="Tactile paper collage showing scattered table cells being matched to an orderly grid" fetchpriority="high" decoding="async"></picture><figcaption>Source page → reading order → semantic table</figcaption></figure>
  </section>
  <section id="import" class="import-section" aria-labelledby="import-heading"><div><p class="eyebrow">Start a table check</p><h2 id="import-heading">Add the page and its OCR cells.</h2><p>Use either input first. OCR JSON should contain a <code>cells</code> or <code>blocks</code> array with text, row, column, and an optional bounding box.</p></div>
    <div class="import-slips">
      <label class="file-slip"><span class="slip-number">01</span><b>Add source image</b><span>PNG, JPEG, WebP, or SVG · stays local</span><input id="image-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
      <label class="file-slip coral"><span class="slip-number">02</span><b>Add OCR JSON</b><span>Cells, blocks, coordinates, and order</span><input id="ocr-file" type="file" accept="application/json,.json"></label>
    </div><p id="import-message" class="form-message" role="status"></p>
  </section>
  <section id="how" class="method"><p class="eyebrow">The three-pass check</p><h2>Check structure, not just spelling.</h2><ol><li><span>1</span><div><h3>Trace the reading order</h3><p>Follow numbered overlays on the source and spot jumps in reading order.</p></div></li><li><span>2</span><div><h3>Label cells and headers</h3><p>Correct text, grid positions, and row or column header roles.</p></div></li><li><span>3</span><div><h3>Export the checked table</h3><p>Export semantic HTML, CSV, JSON, and a plain-language issue report.</p></div></li></ol></section>
  <section class="limitations" aria-labelledby="limitations-heading"><div><p class="eyebrow">Limits of this check</p><h2 id="limitations-heading">What this check cannot confirm</h2></div><div><p>This tool does not create OCR or check spelling. It flags likely structure errors but cannot guarantee accessibility.</p><p>Compare every value with the scan before sharing.</p></div></section>
  ${licenseSection()}`);
  bindLanding();
  bindLicense();
}

function licenseSection() {
  return `<section id="license" class="license-section" aria-labelledby="license-heading"><div><p class="eyebrow">Optional Desk license</p><h2 id="license-heading">Keep saved versions.</h2><p>Core checking and every accessible export stay free. A Desk license adds named saved versions for comparing OCR passes.</p><ul><li>Save named before-and-after versions</li><li>Restore a prior cell structure</li><li>Saved versions stay in this browser</li></ul></div><div class="license-stamp"><p class="license-state">${licenseActive ? '✓ Desk license active' : 'Free table checking is active'}</p>${licenseNotice ? `<p class="license-notice">${escapeHtml(licenseNotice)}</p>` : ''}<div class="purchase-terms"><p class="license-price">US$12 one-time purchase.</p><p>Checkout is processed by Dodo Payments, with Sociobot shown as the business.</p><p>Dodo Payments handles order questions and returns.</p></div>${licenseActive ? '<p>Your saved versions are available on this device.</p>' : `<a class="button primary" href="${API_BASE}/products/${SLUG}/checkout">Get Desk license</a><details><summary>Restore Desk license</summary><form id="license-form"><label for="license-token">License token</label><div class="inline-field"><input id="license-token" name="license" autocomplete="off" required><button class="button quiet" type="submit" aria-label="Verify license">Verify license</button></div></form></details>`}<p class="merchant"><a href="/terms/">Read the Desk license terms</a></p></div></section>`;
}

function readFile(file: File, asText = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The file could not be read. Try a different copy.'));
    if (asText) reader.readAsText(file);
    else reader.readAsDataURL(file);
  });
}

function bindLanding() {
  document.querySelector('[data-action="sample"]')?.addEventListener('click', async (event) => {
    event.preventDefault();
    await enterDemo(true);
  });
  let pendingImage = '';
  const imageInput = document.querySelector<HTMLInputElement>('#image-file')!;
  const ocrInput = document.querySelector<HTMLInputElement>('#ocr-file')!;
  const message = document.querySelector<HTMLElement>('#import-message')!;
  imageInput.addEventListener('change', async () => {
    const file = imageInput.files?.[0]; if (!file) return;
    try {
      if (file.size > 12_000_000) throw new Error('That image is over 12 MB. Compress or crop it before checking.');
      productNotice = ''; pendingImage = await readFile(file);
      project = { id: 'current', name: file.name.replace(/\.[^.]+$/, ''), sourcePage: file.name, image: pendingImage, cells: [], updatedAt: new Date().toISOString(), checkpoints: [] };
      await persist('Source image saved locally. Add OCR JSON or create cells manually.'); render();
    } catch (error) { message.textContent = error instanceof Error ? error.message : 'The image could not be opened.'; }
  });
  ocrInput.addEventListener('change', async () => {
    const file = ocrInput.files?.[0]; if (!file) return;
    try {
      const parsed = parseOcrJson(await readFile(file, true)); productNotice = '';
      project = { id: 'current', name: file.name.replace(/\.[^.]+$/, ''), sourcePage: parsed.sourcePage, image: pendingImage, cells: parsed.cells, updatedAt: new Date().toISOString(), checkpoints: [] };
      await persist(`${parsed.cells.length} OCR blocks imported.`); render();
    } catch (error) { message.textContent = error instanceof Error ? error.message : 'The OCR JSON could not be imported.'; }
  });
}

function tablePreview(cells: Cell[]) {
  if (!cells.length) return '<p class="empty-mini">No cells yet.</p>';
  const matrix = tableMatrix(cells);
  let output = '<table><caption>Current semantic table preview</caption>';
  for (const row of matrix) {
    output += '<tr>';
    for (const cell of row) {
      if (!cell) output += '<td aria-label="Empty cell"></td>';
      else if (cell.role === 'columnheader') output += `<th scope="col">${escapeHtml(cell.text)}</th>`;
      else if (cell.role === 'rowheader') output += `<th scope="row">${escapeHtml(cell.text)}</th>`;
      else output += `<td>${escapeHtml(cell.text)}</td>`;
    }
    output += '</tr>';
  }
  return output + '</table>';
}

function workbench() {
  if (!project) return;
  setMetadata(demoMode ? 'Demo — Accessible Table OCR Check' : 'Table check — Accessible Table OCR Check', demoMode ? 'Try the table reading-order check with an isolated scanned transit table sample.' : 'Compare a scanned table with OCR cells, correct its structure, and export accessible files.', demoMode ? '/demo' : '/');
  const issues = reviewIssues(project.cells);
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const demoResult = demoMode ? `<section class="demo-result" aria-label="Sample result"><p><b>${escapeHtml(project.name)} · ${project.cells.length} cells · ${errorCount} reading-order error${errorCount === 1 ? '' : 's'}</b></p><p>The first flagged jump puts Yes before 12 of 14.</p>${errorCount ? '<button type="button" class="button primary" data-action="quick-demo-fix">Move Yes later</button>' : '<p class="demo-clear">✓ The sample reading order is clear.</p>'}</section>` : '';
  const overlay = project.cells.map((cell, index) => `<button class="overlay ${selectedCell === cell.id ? 'selected' : ''}" style="left:${cell.box.x}%;top:${cell.box.y}%;width:${cell.box.width}%;height:${cell.box.height}%" data-select="${escapeHtml(cell.id)}" aria-label="Reading order ${index + 1}: ${escapeHtml(cell.text || 'blank cell')}, row ${cell.row}, column ${cell.col}"><span>${index + 1}</span></button>`).join('');
  const cells = project.cells.map((cell, index) => `<li class="cell-row ${selectedCell === cell.id ? 'selected' : ''}" id="editor-${escapeHtml(cell.id)}" data-cell="${escapeHtml(cell.id)}"><div class="order-chip" aria-label="Reading order ${index + 1}">${index + 1}</div><div class="cell-fields"><label>Cell text<input data-field="text" value="${escapeHtml(cell.text)}"></label><div class="field-row"><label>Role<select data-field="role"><option value="data" ${cell.role === 'data' ? 'selected' : ''}>Data cell</option><option value="columnheader" ${cell.role === 'columnheader' ? 'selected' : ''}>Column header</option><option value="rowheader" ${cell.role === 'rowheader' ? 'selected' : ''}>Row header</option></select></label><label>Row<input data-field="row" type="number" min="1" max="99" value="${cell.row}"></label><label>Column<input data-field="col" type="number" min="1" max="99" value="${cell.col}"></label></div></div><div class="cell-actions"><button type="button" data-move="up" aria-label="Move ${escapeHtml(cell.text || 'blank cell')} earlier" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-move="down" aria-label="Move ${escapeHtml(cell.text || 'blank cell')} later" ${index === project!.cells.length - 1 ? 'disabled' : ''}>↓</button><button class="remove" type="button" data-remove aria-label="Remove ${escapeHtml(cell.text || 'blank cell')}">×</button></div></li>`).join('');
  const issueItems = issues.map((issue) => `<li class="${issue.severity}"><span aria-hidden="true">${issue.severity === 'error' ? '!' : '?'}</span><div><b>${escapeHtml(issue.message)}</b><p>${escapeHtml(issue.fix)}</p>${issue.cellId ? `<button type="button" class="text-button" data-select="${escapeHtml(issue.cellId)}">Show cell</button>` : ''}</div></li>`).join('');
  app.innerHTML = shell(`<div class="workbench-heading"><div><p class="eyebrow">${demoMode ? 'Sample table check · isolated demo' : 'Open table check · saved locally'}</p><h1>Review reading order</h1></div>${demoResult}${demoMode ? '' : '<button class="button quiet danger-button" type="button" data-action="new">Clear table check</button>'}</div>
  <section class="review-grid" aria-label="Table checking workspace">
    <div class="source-panel"><div class="panel-heading"><div><span class="step-tag">Pass 01</span><h2>Compare the page</h2></div><label class="mini-upload">Replace image<input id="replace-image" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label></div>
      <div class="source-canvas">${project.image ? `<img src="${escapeHtml(project.image)}" alt="Source page for visual comparison">${overlay}` : '<div class="empty-source"><span aria-hidden="true">⌁</span><p>No source image. Add one to compare OCR blocks visually.</p><label class="button quiet">Add source image<input id="empty-image" type="file" accept="image/*"></label></div>'}</div>
      <p class="source-hint">Numbers show the current reading order. Select an overlay to find its editable cell.</p>
    </div>
    <div class="structure-panel"><div class="panel-heading"><div><span class="step-tag coral-tag">Pass 02</span><h2>Correct the structure</h2></div><label class="mini-upload">Import OCR JSON<input id="replace-ocr" type="file" accept="application/json,.json"></label></div>
      <div class="issue-summary ${errorCount ? 'has-errors' : 'clear'}" role="status"><span class="summary-mark" aria-hidden="true">${errorCount ? '!' : '✓'}</span><div><b>${errorCount ? `${errorCount} reading-order or cell error${errorCount === 1 ? '' : 's'}` : 'No structural errors detected'}</b><p>${errorCount ? 'Work through the marked cells before export.' : 'Still compare each value with the source.'}</p></div><button type="button" class="text-button" data-action="issues">Review ${issues.length} issue${issues.length === 1 ? '' : 's'}</button></div>
      <ol class="cell-list">${cells || '<li class="empty-cell-list">No OCR cells yet. Import JSON or add the first cell.</li>'}</ol><button class="add-cell" type="button" data-action="add"><span aria-hidden="true">＋</span> Add cell</button>
    </div>
  </section>
  <section class="proof-meta" aria-label="Table check details"><label>Table check name<input id="project-name" value="${escapeHtml(project.name)}"></label><label>Source reference<input id="source-page" value="${escapeHtml(project.sourcePage)}"></label></section>
  <section class="issues-panel" id="issues" aria-labelledby="issues-heading"><div><p class="eyebrow">Automated checks</p><h2 id="issues-heading">Issue report</h2><p>Checks flag order, blank cells, duplicate positions, and missing header roles. They do not verify OCR spelling.</p></div><ul>${issueItems || '<li class="all-clear"><span aria-hidden="true">✓</span><div><b>Automated checks are clear.</b><p>Complete a final visual comparison before sharing.</p></div></li>'}</ul></section>
  <section class="preview-export" aria-labelledby="export-heading"><div class="preview-sheet"><p class="eyebrow">Assistive-technology view</p><h2>Semantic preview</h2><div class="table-scroll" role="region" aria-label="Scrollable semantic table preview" tabindex="0">${tablePreview(project.cells)}</div></div><div class="export-slip"><span class="step-tag mustard-tag">Pass 03</span><h2 id="export-heading">Export the checked table</h2><p>Every export is created locally. HTML includes table headers and the source-page reference.</p><div class="export-buttons"><button class="button primary" type="button" data-export="html">Export HTML</button><button class="button quiet" type="button" data-export="csv">Export CSV</button><button class="button quiet" type="button" data-export="report">Export issue report</button><button class="button quiet" type="button" data-export="json">Export project JSON</button></div></div></section>
  ${checkpointSection()}
  ${licenseSection()}`);
  bindWorkbench(); bindLicense();
}

function checkpointSection() {
  if (!project) return '';
  const versions = project.checkpoints.map((item) => `<li><div><b>${escapeHtml(item.name)}</b><span>${new Date(item.createdAt).toLocaleString()}</span></div><button class="button quiet" data-restore="${escapeHtml(item.id)}" type="button">Restore</button></li>`).join('');
  return `<section class="checkpoints" aria-labelledby="checkpoint-heading"><div><p class="eyebrow">Desk license</p><h2 id="checkpoint-heading">Saved versions</h2><p>Keep a local before-and-after version while you compare OCR passes.</p></div>${licenseActive ? `<div><form id="checkpoint-form" class="inline-field"><label class="sr-only" for="checkpoint-name">Saved version name</label><input id="checkpoint-name" placeholder="For example: Before header fixes" required><button class="button primary" type="submit">Save version</button></form><ul>${versions || '<li class="empty-checkpoint">No saved versions yet.</li>'}</ul></div>` : '<div class="locked-note"><span aria-hidden="true">◇</span><p><b>Optional workflow extra</b><br>Restore a Desk license below to keep saved versions. Core checking and exports remain available.</p></div>'}</section>`;
}

function bindWorkbench() {
  if (!project) return;
  document.querySelector('#project-name')?.addEventListener('change', (event) => updateMeta('name', (event.target as HTMLInputElement).value));
  document.querySelector('#source-page')?.addEventListener('change', (event) => updateMeta('sourcePage', (event.target as HTMLInputElement).value));
  document.querySelectorAll<HTMLElement>('[data-select]').forEach((button) => button.addEventListener('click', () => {
    selectedCell = button.dataset.select ?? ''; render(); requestAnimationFrame(() => document.querySelector(`#editor-${CSS.escape(selectedCell)} input`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }));
  document.querySelectorAll<HTMLElement>('.cell-row').forEach((row) => {
    const id = row.dataset.cell!;
    row.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-field]').forEach((field) => field.addEventListener('change', () => {
      const cell = project!.cells.find((item) => item.id === id); if (!cell) return;
      const key = field.dataset.field as 'text' | 'role' | 'row' | 'col';
      if (key === 'row' || key === 'col') {
        try {
          cell[key] = boundedGridCoordinate(field.value, key === 'row' ? 'Row' : 'Column');
          field.setCustomValidity('');
          productNotice = '';
        } catch (error) {
          const message = error instanceof Error ? error.message : `Use a position from 1 to ${MAX_GRID_DIMENSION}.`;
          field.value = String(cell[key]);
          field.setCustomValidity(message);
          field.reportValidity();
          productNotice = `${message} The previous position was kept; enter a value from 1 to ${MAX_GRID_DIMENSION}.`;
          render();
          return;
        }
      }
      else if (key === 'role') { cell.role = field.value as Cell['role']; productNotice = ''; }
      else { cell.text = field.value; productNotice = ''; }
      scheduleSave('Cell updated.'); render();
    }));
    row.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((button) => button.addEventListener('click', () => {
      const from = project!.cells.findIndex((item) => item.id === id); const to = button.dataset.move === 'up' ? from - 1 : from + 1;
      if (to < 0 || to >= project!.cells.length) return;
      [project!.cells[from], project!.cells[to]] = [project!.cells[to], project!.cells[from]]; selectedCell = id; scheduleSave('Reading order updated.'); render();
    }));
    row.querySelector<HTMLButtonElement>('[data-remove]')?.addEventListener('click', () => {
      const cell = project!.cells.find((item) => item.id === id); if (!cell || !confirm(`Remove “${cell.text || 'blank cell'}” from this table check?`)) return;
      project!.cells = project!.cells.filter((item) => item.id !== id); scheduleSave('Cell removed.'); render();
    });
  });
  document.querySelector('[data-action="add"]')?.addEventListener('click', () => {
    if (project!.cells.length >= MAX_CELLS) {
      productNotice = `This table check already has ${MAX_CELLS} cells. Remove a cell or split the table before adding another.`;
      render();
      return;
    }
    const position = nextAvailableGridPosition(project!.cells);
    const cell: Cell = { id: crypto.randomUUID(), text: '', ...position, role: 'data', box: { x: 10, y: 10, width: 20, height: 10 } };
    productNotice = ''; project!.cells.push(cell); selectedCell = cell.id; scheduleSave('Blank cell added.'); render();
  });
  document.querySelector('[data-action="issues"]')?.addEventListener('click', () => document.querySelector('#issues')?.scrollIntoView({ behavior: 'smooth' }));
  document.querySelector('[data-action="quick-demo-fix"]')?.addEventListener('click', () => {
    const from = project!.cells.findIndex((cell) => cell.id === 'c6');
    if (from < 0 || from >= project!.cells.length - 1) return;
    [project!.cells[from], project!.cells[from + 1]] = [project!.cells[from + 1], project!.cells[from]];
    selectedCell = 'c6';
    scheduleSave('Reading order updated.');
    render();
  });
  document.querySelector('[data-action="new"]')?.addEventListener('click', async () => {
    if (demoMode) {
      if (!confirm('Reset the sample table check and discard your demo changes?')) return;
      await enterDemo(true);
      return;
    }
    if (!confirm('Clear this table check and remove its locally saved working copy? Export anything you need first.')) return;
    await clearProject(false); project = null; selectedCell = ''; productNotice = ''; render();
  });
  bindImageInput('#replace-image'); bindImageInput('#empty-image');
  document.querySelector<HTMLInputElement>('#replace-ocr')?.addEventListener('change', importOcr);
  document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => button.addEventListener('click', () => exportProject(button.dataset.export!)));
  document.querySelector<HTMLFormElement>('#checkpoint-form')?.addEventListener('submit', (event) => {
    event.preventDefault(); if (!project || !licenseActive) return;
    const input = document.querySelector<HTMLInputElement>('#checkpoint-name')!;
    project.checkpoints.unshift({ id: crypto.randomUUID(), name: input.value.trim(), createdAt: new Date().toISOString(), cells: structuredClone(project.cells) });
    scheduleSave('Saved version created.'); render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-restore]').forEach((button) => button.addEventListener('click', () => {
    const checkpoint = project!.checkpoints.find((item) => item.id === button.dataset.restore); if (!checkpoint) return;
    project!.cells = structuredClone(checkpoint.cells); scheduleSave(`Saved version “${checkpoint.name}” restored.`); render();
  }));
}

function updateMeta(field: 'name' | 'sourcePage', value: string) { if (!project) return; project[field] = value.trim() || (field === 'name' ? 'Untitled table' : 'Source not specified'); scheduleSave('Table check details updated.'); }

function bindImageInput(selector: string) {
  document.querySelector<HTMLInputElement>(selector)?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file || !project) return;
    try { if (file.size > 12_000_000) throw new Error('Image is over 12 MB.'); project.image = await readFile(file); project.sourcePage ||= file.name; await persist('Source image updated.'); render(); }
    catch (error) { announce(error instanceof Error ? error.message : 'Image could not be opened.'); }
  });
}

async function importOcr(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file || !project) return;
  try { const parsed = parseOcrJson(await readFile(file, true)); productNotice = ''; project.cells = parsed.cells; project.sourcePage = parsed.sourcePage || project.sourcePage; await persist(`${parsed.cells.length} OCR blocks imported.`); render(); }
  catch (error) {
    productNotice = `${error instanceof Error ? error.message : 'OCR JSON could not be imported.'} The current table check was not changed; correct the file and import it again.`;
    render();
  }
}

function exportProject(kind: string) {
  if (!project) return;
  try {
    assertBoundedGrid(project.cells);
    const formats: Record<string, { content: string; type: string; ext: string }> = {
      html: { content: accessibleHtml(project), type: 'text/html', ext: 'html' },
      csv: { content: csvExport(project), type: 'text/csv', ext: 'csv' },
      report: { content: issueReport(project), type: 'text/plain', ext: 'txt' },
      json: { content: JSON.stringify(project, null, 2), type: 'application/json', ext: 'json' },
    };
    const format = formats[kind]; if (!format) return;
    const blob = new Blob([format.content], { type: `${format.type};charset=utf-8` });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'table'}-${kind}.${format.ext}`; link.click(); URL.revokeObjectURL(link.href); announce(`${kind === 'report' ? 'Issue report' : kind.toUpperCase()} exported.`);
  } catch (error) {
    productNotice = `${error instanceof Error ? error.message : 'This table check could not be exported.'} Correct the grid positions and try again.`;
    render();
  }
}

function cancelScheduledSave() { window.clearTimeout(saveTimer); saveTimer = 0; }
function scheduleSave(message: string) {
  cancelScheduledSave();
  const queuedProject = project;
  const queuedDemoMode = demoMode;
  saveTimer = window.setTimeout(() => {
    saveTimer = 0;
    void persist(message, queuedProject, queuedDemoMode);
  }, 250);
}
async function persist(message: string, savedProject = project, savedDemoMode = demoMode) {
  if (!savedProject) return;
  assertBoundedGrid(savedProject.cells);
  savedProject.updatedAt = new Date().toISOString();
  await saveProject(savedProject, savedDemoMode);
  if (project === savedProject && demoMode === savedDemoMode) announce(message);
}
function announce(message: string) { const live = document.querySelector<HTMLElement>('#live-status'); if (live) live.textContent = message; }

function bindLicense() {
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const input = document.querySelector<HTMLInputElement>('#license-token')!; const token = input.value.trim(); if (!token) return;
    localStorage.setItem(LICENSE_KEY, token); licenseNotice = 'Checking this license…'; render(); await verifyLicense(token, true);
  });
}

async function initializeLicense() {
  const url = new URL(location.href); const returned = url.searchParams.get('license');
  if (returned) { localStorage.setItem(LICENSE_KEY, returned); url.searchParams.delete('license'); history.replaceState({}, '', url.pathname + url.search + url.hash); }
  const token = returned || localStorage.getItem(LICENSE_KEY); if (!token) return;
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { valid?: boolean; checkedAt?: number } | null;
  licenseActive = returned ? true : Boolean(cached?.valid);
  if (cached?.checkedAt && Date.now() - cached.checkedAt < 86_400_000 && !returned) return;
  void verifyLicense(token, false);
}

async function verifyLicense(token: string, rerender: boolean) {
  try {
    const response = await fetch(`${LICENSE_VERIFY_PATH}?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error(response.status === 429 ? 'Too many verification attempts. Wait a minute and try again.' : 'Verification service unavailable.');
    const result = await response.json() as { valid: boolean; reason?: string };
    licenseActive = result.valid; localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    licenseNotice = result.valid ? 'License verified on this device.' : 'This license is no longer active. Free checking and exports are unchanged.';
  } catch { licenseNotice = licenseActive ? 'Offline: using the last valid license check.' : 'Could not verify right now. Try again when online.'; }
  if (rerender || document.querySelector('#license')) render();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { const toast = document.querySelector<HTMLElement>('#update-toast'); if (toast) toast.hidden = false; } });
    });
  }).catch(() => undefined);
}

async function checkOfflineMarker() {
  if (!('caches' in window)) return;
  if (await caches.match('/offline-state')) {
    isOffline = true;
    sessionStorage.setItem('proof-desk-offline', 'true');
    render();
  }
}

function notFoundPage() {
  demoMode = false;
  setMetadata('Page not found — Accessible Table OCR Check', 'This page does not exist. Return to the table checker or open its isolated sample.', location.pathname);
  app.innerHTML = shell(`<section class="not-found"><p class="eyebrow">Error 404</p><h1>This page does not exist</h1><p>The address may be old or mistyped. Return to the table checker or open its sample.</p><div class="hero-actions"><a class="button primary" href="/">Return to the table checker</a><a class="button quiet" href="/demo">Try the sample</a></div><div class="misprint" aria-hidden="true"><span>4</span><i>＋</i><span>4</span></div></section>`);
}

async function loadCurrentMode() {
  try {
    const saved = await loadProject(demoMode);
    if (!saved) { project = null; return; }
    const recovered = repairPersistedGrid(saved);
    project = recovered.project;
    if (recovered.repaired) {
      productNotice = `Positions outside the supported 1–${MAX_GRID_DIMENSION} grid were moved to the nearest boundary. Review those positions or import corrected OCR JSON.`;
      await saveProject(project, demoMode);
    }
  } catch { project = null; }
}

async function enterDemo(reset = false) {
  demoMode = true;
  productNotice = '';
  selectedCell = '';
  if (reset) {
    cancelScheduledSave();
    await clearProject(true);
  }
  project = reset ? null : await loadProject(true);
  if (!project) {
    project = structuredClone(sampleProject);
    project.id = 'current';
    await persist('Sample data is ready.');
  }
  if (location.pathname.replace(/\/+$/, '') !== '/demo') history.pushState({}, '', '/demo');
  focusAfterRender = true;
  render();
}

async function startForReal() {
  cancelScheduledSave();
  await clearProject(true);
  demoMode = false;
  productNotice = '';
  selectedCell = '';
  history.pushState({}, '', '/');
  await loadCurrentMode();
  focusAfterRender = true;
  render();
}

async function navigate(path: string) {
  const nextDemo = path.replace(/\/+$/, '') === '/demo';
  if (nextDemo) { await enterDemo(false); return; }
  demoMode = false;
  history.pushState({}, '', path);
  if (path === '/') await loadCurrentMode();
  focusAfterRender = true;
  render();
}

function render() {
  const path = location.pathname.replace(/\/+$/, '');
  if (path === '/privacy') legalPage('privacy');
  else if (path === '/terms') legalPage('terms');
  else if (path === '/demo' && project) workbench();
  else if (path === '' && project) workbench();
  else if (path === '') landing();
  else notFoundPage();
  if (focusAfterRender) {
    focusAfterRender = false;
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus();
      announce(`${heading.textContent?.trim() ?? 'Page'} loaded`);
    });
  }
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
  if (action === 'reload') location.reload();
  if (action === 'reset-demo') { event.preventDefault(); void enterDemo(true); }
  if (action === 'start-real') { event.preventDefault(); void startForReal(); }
  const anchor = target.closest<HTMLAnchorElement>('a[href]');
  if (!anchor || event.defaultPrevented || anchor.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || url.hash) return;
  if (['/', '/demo', '/privacy/', '/terms/'].includes(url.pathname)) {
    event.preventDefault();
    void navigate(url.pathname);
  }
});

window.addEventListener('popstate', async () => {
  demoMode = location.pathname.replace(/\/+$/, '') === '/demo';
  if (demoMode || location.pathname === '/') await loadCurrentMode();
  focusAfterRender = true;
  render();
});
window.addEventListener('online', () => { isOffline = false; sessionStorage.removeItem('proof-desk-offline'); render(); });
window.addEventListener('offline', () => { isOffline = true; sessionStorage.setItem('proof-desk-offline', 'true'); render(); });

if (new URL(location.href).searchParams.get('demo') === '1') history.replaceState({}, '', '/demo');
await initializeLicense();
await loadCurrentMode();
if (demoMode && !project) {
  project = structuredClone(sampleProject);
  project.id = 'current';
  await persist('Sample data is ready.');
}
render();
registerServiceWorker();
void checkOfflineMarker();
