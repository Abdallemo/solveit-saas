import { getCurrentServerTime } from "@/lib/utils/date-time";
import { addDays, addHours, addWeeks } from "date-fns";

export const SOLVER_MIN_WITHDRAW_AMOUNT = 30;
export function getNewReleaseDate(
  opt: "d" | "h" | "w" = "h",
  defaultRelease = 24,
) {
  switch (opt) {
    case "h":
      return addHours(getCurrentServerTime(), defaultRelease);
    case "d":
      return addDays(getCurrentServerTime(), defaultRelease);
    case "w":
      return addWeeks(getCurrentServerTime(), defaultRelease);
    default:
      return addHours(getCurrentServerTime(), defaultRelease);
  }
}
