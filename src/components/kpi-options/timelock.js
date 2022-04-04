export const isApril3rd = () => {
    const now = new Date().getTime();
    const APRIL_3RD = new Date('04-03-2022 00:00:00 GMT+0').getTime();
    return now > APRIL_3RD;
};
