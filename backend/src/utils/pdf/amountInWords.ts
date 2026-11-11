const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function twoDigits(num: number): string {
  if (num <= 0) return ""
  if (num < 20) return ONES[num]
  const ones = num % 10
  return `${TENS[Math.floor(num / 10)]}${ones ? ` ${ONES[ones]}` : ""}`
}

function threeDigits(num: number): string {
  const hundreds = Math.floor(num / 100)
  const rest = num % 100
  return [hundreds ? `${ONES[hundreds]} Hundred` : "", twoDigits(rest)].filter(Boolean).join(" ")
}

function toIndianWords(num: number): string {
  if (num <= 0) return "Zero"
  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = num % 1000
  return [
    crore ? `${toIndianWords(crore)} Crore` : "",
    lakh ? `${twoDigits(lakh)} Lakh` : "",
    thousand ? `${twoDigits(thousand)} Thousand` : "",
    hundred ? threeDigits(hundred) : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export function amountInWords(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ""
  const rupees = Math.floor(value)
  const paise = Math.round((value - rupees) * 100)
  const paisePart = paise > 0 ? ` and ${toIndianWords(paise)} Paise` : ""
  return `Rupees ${toIndianWords(rupees)}${paisePart} Only`
}
