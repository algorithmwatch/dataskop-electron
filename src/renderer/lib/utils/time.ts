import dayjs from '../dayjs';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getNowString = () => dayjs().format('YYYY-MM-DD-HH-mm-ss');

export { delay, getNowString };
