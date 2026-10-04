const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Dates arrive as ISO strings (yyyy-mm-dd) and are parsed as local time so a
   date never shifts a day across timezones. */
export function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function fmtDate(iso) {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDayDate(iso) {
  const d = parseISO(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function toISO(date) {
  const p = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function dayName(iso) {
  return DAYS[parseISO(iso).getDay()];
}

/* The next `count` days starting today, for the booking date strip. */
export function nextDays(count = 7, from = new Date()) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { iso: toISO(d), day: DAYS[d.getDay()], date: d.getDate() };
  });
}

export function isPast(iso) {
  const now = new Date();
  return parseISO(iso) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const DAY_KEYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/* The abbreviated day names a doctor consults on, derived from the availability
   template the API returns ({ weekly: { MONDAY: [{start,end}], ... } }). Order is
   Sunday-first so it can also drive the date strip. */
export function consultingDays(availability) {
  const weekly = availability?.weekly;
  if (!weekly) return [];
  return DAY_KEYS.map((key, i) => ((weekly[key] || []).length ? DAYS[i] : null)).filter(Boolean);
}

/* The template ranges for one ISO date, e.g. [{start:"09:00", end:"13:00"}]. */
export function templateForDate(availability, iso) {
  const weekly = availability?.weekly;
  if (!weekly) return [];
  return weekly[DAY_KEYS[parseISO(iso).getDay()]] || [];
}
