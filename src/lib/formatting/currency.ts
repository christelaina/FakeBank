const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const percentFormatter = new Intl.NumberFormat("en-CA", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCad(amount: number): string {
  return cadFormatter.format(amount);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

export function formatCanadianDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatCanadianDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
