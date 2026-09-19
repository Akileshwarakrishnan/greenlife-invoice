"""
Helper to convert numeric amounts to Indian English words (e.g. 400 -> 'Four Hundred Only')
"""

ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
]

TENS = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
]

def _two_digits(n: int) -> str:
    if n < 20:
        return ONES[n]
    tens = TENS[n // 10]
    ones = ONES[n % 10]
    return f"{tens} {ones}".strip()

def _three_digits(n: int) -> str:
    hundreds = n // 100
    rem = n % 100
    res = ""
    if hundreds > 0:
        res += f"{ONES[hundreds]} Hundred"
        if rem > 0:
            res += f" and {_two_digits(rem)}"
    else:
        res = _two_digits(rem)
    return res.strip()

def number_to_words_inr(amount: float) -> str:
    if amount is None or amount == 0:
        return "Zero Only"

    rupees = int(abs(amount))
    paise = int(round((abs(amount) - rupees) * 100))

    if rupees == 0 and paise == 0:
        return "Zero Only"

    crore = rupees // 10000000
    rem = rupees % 10000000

    lakh = rem // 100000
    rem = rem % 100000

    thousand = rem // 1000
    rem = rem % 1000

    parts = []
    if crore > 0:
        parts.append(f"{_two_digits(crore)} Crore")
    if lakh > 0:
        parts.append(f"{_two_digits(lakh)} Lakh")
    if thousand > 0:
        parts.append(f"{_two_digits(thousand)} Thousand")
    if rem > 0:
        parts.append(_three_digits(rem))

    rupees_str = " ".join(parts).strip()
    
    if paise > 0:
        paise_str = f"{_two_digits(paise)} Paise"
        if rupees_str:
            return f"{rupees_str} Rupees and {paise_str} Only"
        return f"{paise_str} Only"

    return f"{rupees_str} Only"
