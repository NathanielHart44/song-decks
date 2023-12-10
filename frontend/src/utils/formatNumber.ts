export function fData(number: number): string {
  if (isNaN(number)) return '0';

  const symbols = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "K" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "B" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
  ];

  // Find the appropriate symbol
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = symbols.length - 1; i > 0; i--) {
      if (number >= symbols[i].value) {
          break;
      }
  }

  return (number / symbols[i].value).toFixed(1).replace(rx, "$1") + symbols[i].symbol;
}
