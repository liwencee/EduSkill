/**
 * Phone-number sanitizer for in-platform chat.
 * Any pattern that looks like a phone number has its digits replaced with ★.
 * Regular short numbers (prices, years, counts) are left alone.
 */

const PHONE_PATTERNS = [
  // Nigerian mobile: 080/081/070/090/091 etc. (11 digits)
  /(\+?234|0)[789][01]\d{8}/g,
  // Nigerian with spaces/dashes: 0801 234 5678 or 0801-234-5678
  /0[789][01]\d?\s?\d{3}[\s\-.]?\d{4}/g,
  // International with country code: +234 801 234 5678
  /\+\d{1,3}[\s\-.]?\(?\d{1,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{4}/g,
  // Generic long digit run: 10–15 consecutive digits (no separators)
  /\b\d{10,15}\b/g,
  // Digit sequences separated by common phone separators (e.g. 081 234 56789)
  /\b\d{3,4}[\s.\-]\d{3,4}[\s.\-]\d{4,5}\b/g,
]

/** Replace every digit inside a phone-number match with ★ */
export function sanitizeMessage(text: string): string {
  let result = text
  for (const re of PHONE_PATTERNS) {
    re.lastIndex = 0
    result = result.replace(re, (match) => match.replace(/\d/g, '★'))
  }
  return result
}

/** Returns true if the text appears to contain a phone number */
export function containsPhoneNumber(text: string): boolean {
  return PHONE_PATTERNS.some(re => {
    re.lastIndex = 0
    return re.test(text)
  })
}
