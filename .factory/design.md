# Visual thesis: the proofing table

## Direction and rationale

The product uses a **risograph tactile collage** drawn from librarians' paper slips, proof marks, scanning beds, and imperfect two-ink registration. Source material sits on warm uncoated paper; detected cells become offset blocks of coral and blue ink; numbered circles behave like hand-applied inspection stickers. This makes the visual language explain the job: compare the page, trace order, then correct structure. It deliberately avoids the glossy dashboard and generic gradient hero patterns that would trivialize careful accessibility work.

The interface is single-mode and explicitly light: an editorial proofing desk. A dark theme would obscure the source-document comparison metaphor and is therefore not included.

## Tokens

- Paper background: `#f3eedf`; paper surface: `#fffaf0`; raised sheet: `#fffcf5`.
- Ink text: `#172321`; secondary ink: `#46534f`; hairline: `#776f61`.
- Process blue / action: `#075f6b`; blue wash: `#c8e0dc`; action contrast: `#ffffff`.
- Riso coral / attention: `#b43a2f`; coral wash: `#f2c8bd`.
- Mustard / selection: `#d4a51f`; mustard wash: `#f4e3a5`.
- Success: `#21663f`; warning: `#805c00`; danger: `#a42d27`.
- All body-text pairings target WCAG AA contrast (4.5:1 or better); state is always expressed with words or symbols as well as color.

## Typography

- Display: Georgia, `Times New Roman`, serif — a sturdy editorial face with book-table associations.
- Utility/body: system sans (`-apple-system`, BlinkMacSystemFont, `Segoe UI`, sans-serif) — familiar and highly legible; no runtime font request.
- Scale: 16px body, 18px lead, 20px section heading, fluid 32–52px display. Line height 1.55 body / 1.05 display. Table values use tabular figures.

## Spacing and shape

An 8px base rhythm with 4px micro-spacing; primary intervals are 8, 16, 24, 32, 48, and 72px. Sheets use near-square 2–6px corners rather than generic rounded cards. Shadows are hard offset print shadows, never soft floating blur. Touch targets are at least 44px. Desktop review is a 5/7 split; at 760px it stacks into source then structure, and secondary ornament disappears.

## Interaction grammar

- Teal means “continue or export”; coral marks issues; mustard marks the active cell.
- Source overlay labels and editable cell labels share the same order number, letting users map them without color.
- Reordering uses explicit up/down controls, drag-and-drop on pointer devices, and keyboard shortcuts; headers use a native select.
- Status is written in a compact proof slip. Autosave feedback is announced politely.

## Motion policy

State changes use a 180ms paper-slide or opacity transition. Overlay focus appears from its cell origin; the update notice rises from the bottom. No animation loops. Under `prefers-reduced-motion: reduce`, transitions and smooth scrolling become instant and decorative texture is static.

## Asset plan and provenance

- `public/assets/proofing-table.webp`: original generated hero illustration, used to introduce source-to-structure comparison without implying automatic OCR. The 1280×853 WebP is paired with a locally derived 640×427 mobile WebP; both preserve the 1.5:1 composition, have explicit dimensions, and remain under 300KB.
- `public/assets/social-preview.jpg`: a 1200×630 center crop composed locally from the original proofing-table artwork for link previews; no additional source material was used.
- App icons and interface symbols are hand-authored SVG/CSS using simple registration crosses and cell shapes.
- Generation model: factory Azure image deployment via `/opt/fleet/lib/gen-image.sh` (OpenAI image model), generated 2026-08-28. Original to this product; no third-party source imagery.

### Prompt sheet

Subject: a top-down librarian's proofing desk with one scanned book page containing an abstract grid, translucent numbered paper cells being rearranged into a clean table, crop marks and registration crosses. World/materials: warm uncoated paper, cut paper, fibrous edges, soy ink, subtle halftone. Light/lens: flat editorial overhead light, orthographic top-down composition. Palette words: warm oat paper, deep petrol ink, faded vermilion, muted mustard, charcoal. Composition: landscape, action centered-right with calm negative paper area at left; no readable text. Negative list: no people, hands, laptops, logos, brands, watermarks, legible words, photorealistic UI screenshots, gradients, glossy 3D, illegible pseudo-text.

Exact production prompt: “Wide landscape editorial risograph collage for an accessibility table proofing tool. Top-down librarian proofing desk made from warm uncoated paper and cut-paper layers. One scanned book page shows an abstract grid with no letters; translucent numbered-style circles and cell-shaped paper pieces travel from the scan into a clean semantic table grid. Crop marks, subtle registration crosses, fibrous edges, two-color overprint, halftone grain. Deep petrol blue, faded vermilion coral, muted mustard, charcoal on warm oat paper. Flat overhead light, tactile handmade composition, useful quiet negative space at left. No people, no hands, no laptop, no logos, no brands, no watermark, no readable text or letters, no glossy 3D, no gradient.”
