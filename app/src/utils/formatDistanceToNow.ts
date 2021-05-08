import dateFnsFormatDistanceToNow from "date-fns/formatDistanceToNow";
import differenceInDays from "date-fns/differenceInDays";
import format from "date-fns/format";

export default function formatDistanceToNow(datetime: Date) {
  if (differenceInDays(new Date(), datetime) < 1) {
    return dateFnsFormatDistanceToNow(datetime, {
      addSuffix: true,
    })
      .replace("about ", "")
      .replace("less than a minute", "1 min")
      .replace("minutes", "min")
      .replace("minute", "min");
  }
  return format(datetime, "yyyy-MM-dd");
}
