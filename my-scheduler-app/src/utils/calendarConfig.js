import { dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ko from "date-fns/locale/ko";

const locales = {
  "ko": ko,
};

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// 커스텀 이벤트 스타일
export const eventStyleGetter = (event) => {
  return {
    style: {
      backgroundColor: event.color,
      borderRadius: "6px",
      color: "#fff",
      border: "none",
      padding: "2px 8px",
      fontWeight: 600,
      fontSize: "0.95em",
      opacity: 0.95,
    },
  };
};
