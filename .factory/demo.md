# Isolated demo

- URL: <https://accessible-table-ocr-check.sociobot.in/demo> or `/?demo=1`
- Sample: a nine-cell transit-access survey with a source image, two deliberate reading-order errors, headers, and export-ready data.
- Storage: demo changes use IndexedDB database `demo:table-proofing-desk`. Real work uses `table-proofing-desk`.
- Reset: choose **Reset demo** in the persistent banner to restore the original sample.
- Exit: choose **Start for real**. This deletes the demo record, then restores any existing real table check without changing it.

The direct demo route is installed with the offline shell. It remains editable and exportable after the first connected visit.
