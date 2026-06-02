const VIETNAM_OFFSET_MINUTES = 7 * 60;
const VIETNAM_OFFSET_MS = VIETNAM_OFFSET_MINUTES * 60 * 1000;

export function getVietnamStartOfDay(date = new Date()): Date {
  const utcMillis = date.getTime();
  const vnMillis = utcMillis + VIETNAM_OFFSET_MS;
  const vnDate = new Date(vnMillis);

  const midnightUtcMs =
    Date.UTC(
      vnDate.getUTCFullYear(),
      vnDate.getUTCMonth(),
      vnDate.getUTCDate(),
    ) - VIETNAM_OFFSET_MS;

  return new Date(midnightUtcMs);
}

export function parseVietnamDate(dateString: string): Date {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD`);
  }

  const [year, month, day] = parts.map(Number) as [number, number, number];

  if ([year, month, day].some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD`);
  }

  const midnightUtcMs = Date.UTC(year, month - 1, day) - VIETNAM_OFFSET_MS;

  return new Date(midnightUtcMs);
}

export function getVietnamTodayAt(
  hour: number,
  minute = 0,
  second = 0,
  ms = 0,
): Date {
  const now = new Date();
  const utcMillis = now.getTime();
  const vnMillis = utcMillis + VIETNAM_OFFSET_MS;
  const vnDate = new Date(vnMillis);

  const targetUtcMs =
    Date.UTC(
      vnDate.getUTCFullYear(),
      vnDate.getUTCMonth(),
      vnDate.getUTCDate(),
      hour,
      minute,
      second,
      ms,
    ) - VIETNAM_OFFSET_MS;

  return new Date(targetUtcMs);
}

export function getVietnamDateKey(date = new Date()): string {
  const vnDate = new Date(date.getTime() + VIETNAM_OFFSET_MS);
  const year = vnDate.getUTCFullYear();
  const month = String(vnDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(vnDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseVietnamDateKey(dateString: string): string {
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD`);
  }

  const [year, month, day] = parts.map(Number) as [number, number, number];
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD`);
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
