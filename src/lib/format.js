export function formatPeso(amount, { compact = false, sign = false } = {}) {
  const abs = Math.abs(amount);
  let formatted;
  if (compact && abs >= 1_000_000) {
    formatted = '₱' + (abs / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (compact && abs >= 1_000) {
    formatted = '₱' + (abs / 1_000).toFixed(0) + 'k';
  } else {
    formatted = '₱' + abs.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  if (sign && amount > 0) return '+' + formatted;
  if (amount < 0) return '-' + formatted;
  return formatted;
}

export function formatDate(isoString, { relative = false } = {}) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (relative) {
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `Today, ${formatTime(date)}`;
    if (days === 1) return `Yesterday, ${formatTime(date)}`;
    return formatShortDate(date);
  }
  return formatShortDate(date);
}

export function formatTime(date) {
  return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatShortDate(date) {
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}
