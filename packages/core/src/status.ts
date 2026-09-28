import type { Mall } from "./malls";

export interface MallStatus {
  isOpen: boolean;
  localTime: string;
  hoursValid: boolean;
  isHoliday: boolean;
}

function toMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function getMallStatus(mall: Mall, now: Date = new Date()): MallStatus {
  const opening = toMinutes(mall.openingTime);
  const closing = toMinutes(mall.closingTime);
  let localTime: string;
  let localDate: string;
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: mall.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(now);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    localTime = `${values.hour}:${values.minute}`;
    localDate = `${values.year}-${values.month}-${values.day}`;
  } catch (error) {
    if (error instanceof RangeError) {
      return { isOpen: false, localTime: "--:--", hoursValid: false, isHoliday: false };
    }
    throw error;
  }
  const current = toMinutes(localTime);

  if (opening === null || closing === null || current === null || opening === closing) {
    return { isOpen: false, localTime, hoursValid: false, isHoliday: false };
  }

  const isHoliday = mall.closedDates?.includes(localDate) ?? false;
  if (isHoliday) {
    return { isOpen: false, localTime, hoursValid: true, isHoliday: true };
  }

  const isOpen =
    opening < closing
      ? current >= opening && current < closing
      : current >= opening || current < closing;

  return { isOpen, localTime, hoursValid: true, isHoliday: false };
}
