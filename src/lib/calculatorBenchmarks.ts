/**
 * calculatorBenchmarks.ts
 *
 * Canonical benchmark constants for the Investment Calculator.
 * Source citations are shown as tooltips in the UI.
 * Rates are annualised 5-year averages — do not change without updating the
 * source citation string and the tooltip copy in the i18n messages files.
 */

export const BENCHMARKS = {
  sp500: {
    label: "S&P 500 5-yr avg",
    annualRate: 0.102, // 10.2%
    source: "S&P 500 historical total return, 2020–2025",
    dashPattern: "8 4",     // dashed (chart reference line)
    color: "#9CA3AF",       // gray-400
  },
  uaeSavings: {
    label: "UAE Savings 5-yr avg",
    annualRate: 0.035, // 3.5%
    source: "UAE Central Bank average savings rate, 2020–2025",
    dashPattern: "3 3",     // dotted
    color: "#6B7280",       // gray-500
  },
  dubaiProperty: {
    label: "Dubai property 5-yr avg",
    annualRate: 0.074, // 7.4%
    source: "DLD transaction data, annualised 5-yr avg",
    dashPattern: undefined, // solid
    color: "#C9A84C",       // gold
  },
} as const;

/**
 * Compound 5-yr ROI for a given annual rate, expressed as a percentage.
 * e.g. benchmarkRoi5yr(0.102) → ~62.9
 */
export function benchmarkRoi5yr(annualRate: number): number {
  return (Math.pow(1 + annualRate, 5) - 1) * 100;
}
