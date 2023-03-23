import dayjs from "../dayjs";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getNowString = () => dayjs().format("YYYY-MM-DD-HH-mm-ss");

const formatNumber = (number: number) => {
  return Math.round(number).toLocaleString("de-DE");
};

export { delay, getNowString, formatNumber };
