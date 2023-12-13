import numeral from 'numeral';

export function fData(number: string | number) {
    return numeral(number).format('0.0 b');
}

export function fShortenNumber(number: string | number) {
    return numeral(number).format('0.00a').replace('.00', '');
}

export function fNumber(number: string | number, precision: number = 0) {
    const formatString = `0,0.[${'0'.repeat(precision)}]`;
    return numeral(number).format(formatString);
}