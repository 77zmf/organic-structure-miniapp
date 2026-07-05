export function formatChemicalFormula(value: string): string {
  return subscriptDigits(escapeHtml(value));
}

export function formatChemistryText(value: string): string {
  return escapeHtml(value).replace(
    /\b(?=[A-Z][A-Za-z0-9]*\d)(?:C\d*H\d*(?:O\d*)?|CO\d+|H\d+|O\d+)\b/g,
    (formula) => subscriptDigits(formula)
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function subscriptDigits(value: string): string {
  return value.replace(/(\d+)/g, '<sub>$1</sub>');
}
