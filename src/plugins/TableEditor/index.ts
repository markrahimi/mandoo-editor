export { default as TableInsertModal } from './TableInsertModal';
export { default as TableContextBar } from './TableContextBar';

/** Insert an HTML table at the current cursor position. */
export function insertTable(rows: number, cols: number, hasHeader: boolean): void {
  let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0">';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      if (r === 0 && hasHeader) {
        html += '<th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f1f5f9;font-weight:700;text-align:left">&nbsp;</th>';
      } else {
        html += '<td style="border:1px solid #e2e8f0;padding:8px 12px">&nbsp;</td>';
      }
    }
    html += '</tr>';
  }
  html += '</table><p><br></p>';
  document.execCommand('insertHTML', false, html);
}
