import re
from typing import List, Dict, Any, Optional

# Comprehensive Organic Store Tamil-to-English Dictionary
TAMIL_PRODUCT_DICTIONARY = {
    # Traditional Powders (பொடி வகைகள்)
    "இட்லி பொடி": "Idli Podi",
    "இட்லி பொடி / காரம்": "Spicy Idli Podi",
    "பருப்பு பொடி": "Paruppu Podi (Lentil Powder)",
    "பூண்டு பொடி": "Garlic Podi",
    "கொள்ளு பொடி": "Horse Gram Podi",
    "கருவேப்பிலை பொடி": "Curry Leaves Podi",
    "முடக்கத்தான் பொடி": "Mudakathan Herbal Podi",
    "தூதுவளை பொடி": "Thoothuvalai Herbal Podi",
    "வல்லாரை பொடி": "Vallarai Brain Tonic Podi",
    "முருங்கை இலை பொடி": "Moringa Leaf Podi",
    "சுக்கு காபி பொடி": "Sukku Malli Coffee Powder",
    "சுக்கு மல்லி காபி": "Sukku Malli Herbal Coffee",
    "சுக்கு காபி": "Dry Ginger Coffee",
    "மஞ்சள் பொடி": "Pure Turmeric Powder",
    "மஞ்சள் தூள்": "Turmeric Powder",
    "சாம்பார் பொடி": "Traditional Sambar Powder",
    "சாம்பார் தூள்": "Sambar Powder",
    "ரசப்பொடி": "Traditional Rasam Powder",
    "ரசத்தூள்": "Rasam Powder",
    "வத்தல் குழம்பு பொடி": "Vatha Kuzhambu Powder",
    "பிரியாணி மசாலா": "Organic Biryani Masala",
    "கரம் மசாலா": "Garam Masala",
    "மல்லித் தூள்": "Coriander Powder",
    "மல்லி பொடி": "Coriander Powder",
    "மிளகாய் தூள்": "Pure Red Chilli Powder",
    "மிளகாய் பொடி": "Red Chilli Powder",
    "காஷ்மீரி மிளகாய் தூள்": "Kashmiri Chilli Powder",
    "ஆவாரம் பூ பொடி": "Avarampoo Herbal Tea Powder",

    # Natural Sweeteners & Sugars (நாட்டு சர்க்கரை வகைகள்)
    "நாட்டு சர்க்கரை": "Country Sugar (Organic Cane Sugar)",
    "நாட்டுச் சர்க்கரை": "Country Sugar (Organic Cane Sugar)",
    "பனை வெல்லம்": "Palm Jaggery (Karupatti)",
    "கருப்பட்டி": "Palm Jaggery (Karupatti)",
    "பனை கருப்பட்டி": "Pure Palm Karupatti",
    "பனை கற்கண்டு": "Palm Sugar Candy (Panangarkandu)",
    "பனங்கற்கண்டு": "Palm Sugar Candy (Panangarkandu)",
    "கற்கண்டு": "Rock Sugar Candy",
    "வெல்லம்": "Traditional Cane Jaggery",
    "மண்டை வெல்லம்": "Round Cane Jaggery",
    "உருண்டை வெல்லம்": "Round Jaggery",
    "அச்சு வெல்லம்": "Mould Cane Jaggery",
    "தேன்": "Pure Wild Honey",
    "மலைத்தேன்": "Raw Forest Honey",
    "மலை தேன்": "Raw Forest Honey",
    "கொம்பு தேன்": "Kombu Honey (Small Bee Honey)",

    # Cold Pressed Traditional Oils (மரச்செக்கு எண்ணெய்கள்)
    "மரச்செக்கு நல்லெண்ணெய்": "Cold Pressed Sesame Oil",
    "நல்லெண்ணெய்": "Cold Pressed Sesame Oil",
    "செக்கு நல்லெண்ணெய்": "Cold Pressed Sesame Oil",
    "மரச்செக்கு தேங்காய் எண்ணெய்": "Cold Pressed Coconut Oil",
    "தேங்காய் எண்ணெய்": "Cold Pressed Coconut Oil",
    "செக்கு தேங்காய் எண்ணெய்": "Cold Pressed Coconut Oil",
    "மரச்செக்கு கடலை எண்ணெய்": "Cold Pressed Groundnut Oil",
    "கடலை எண்ணெய்": "Cold Pressed Groundnut Oil",
    "செக்கு கடலை எண்ணெய்": "Cold Pressed Groundnut Oil",
    "மரச்செக்கு விளக்கெண்ணெய்": "Cold Pressed Castor Oil",
    "விளக்கெண்ணெய்": "Pure Castor Oil",
    "கடுகு எண்ணெய்": "Cold Pressed Mustard Oil",
    "வேப்பெண்ணெய்": "Neem Seed Oil",
    "பசு நெய்": "Pure Country Cow Ghee",
    "நாட்டு பசு நெய்": "A2 Desi Cow Ghee",
    "நெய்": "Pure Cow Ghee",

    # Traditional Rice Varieties (பாரம்பரிய அரிசி)
    "சீரக சம்பா அரிசி": "Seeraga Samba Traditional Rice",
    "சீரக சம்பா": "Seeraga Samba Traditional Rice",
    "கருப்பு கவுனி அரிசி": "Black Kavuni Traditional Rice",
    "கருப்பு கவுனி": "Black Kavuni Rice",
    "மாப்பிள்ளை சம்பா அரிசி": "Mappillai Samba Rice",
    "மாப்பிள்ளை சம்பா": "Mappillai Samba Rice",
    "தூயமல்லி அரிசி": "Thooyamalli Traditional Rice",
    "தூயமல்லி": "Thooyamalli Traditional Rice",
    "காட்டுயானம் அரிசி": "Kaattuyanam Traditional Rice",
    "காட்டுயானம்": "Kaattuyanam Rice",
    "பூங்கார் அரிசி": "Poongar Traditional Rice",
    "பூங்கார்": "Poongar Rice (Women's Health)",
    "கிச்சிலி சம்பா அரிசி": "Kichili Samba Rice",
    "கிச்சிலி சம்பா": "Kichili Samba Rice",
    "சிவப்பு அரிசி": "Red Rice",
    "சிவப்பு புட்டு அரிசி": "Red Puttu Rice",
    "கைக்குத்தல் அரிசி": "Hand Pounded Rice",
    "குள்ளக்கார் அரிசி": "Kullakar Traditional Rice",
    "குள்ளக்கார்": "Kullakar Rice",
    "இலுப்பைப்பூ சம்பா": "Iluppaipoo Samba Rice",

    # Millets & Grains (சிறு தானியங்கள்)
    "குதிரைவாலி": "Barnyard Millet (Kuthiraivali)",
    "குதிரைவாலி அரிசி": "Barnyard Millet Rice",
    "சாமை": "Little Millet (Samai)",
    "சாமை அரிசி": "Little Millet Rice",
    "திணை": "Foxtail Millet (Thinai)",
    "திணை அரிசி": "Foxtail Millet Rice",
    "வரகு": "Kodo Millet (Varagu)",
    "வரகு அரிசி": "Kodo Millet Rice",
    "கம்பு": "Pearl Millet (Kambu)",
    "கம்மு": "Pearl Millet (Kambu)",
    "கம்பு மாவு": "Pearl Millet Flour",
    "ராகி": "Finger Millet (Ragi)",
    "கேழ்வரகு": "Finger Millet (Ragi)",
    "ராகி மாவு": "Ragi Flour",
    "கேழ்வரகு மாவு": "Ragi Flour",
    "சோளம்": "Sorghum (Cholam)",
    "வெள்ளை சோளம்": "White Sorghum",
    "சிவப்பு சோளம்": "Red Sorghum",

    # Pulses & Legumes (பருப்பு & பயறு வகைகள்)
    "துவரம் பருப்பு": "Organic Toor Dal",
    "நாட்டு துவரம் பருப்பு": "Native Country Toor Dal",
    "பாசிப்பயறு": "Green Gram Whole",
    "பாசி பருப்பு": "Moong Dal",
    "உளுத்தம் பருப்பு": "White Urad Dal",
    "உளுந்து": "Urad Dal",
    "கருப்பு உளுந்து": "Whole Black Urad Dal",
    "வறுத்த உளுந்து": "Roasted Urad Dal",
    "கடலை பருப்பு": "Chana Dal (Bengal Gram)",
    "கொண்டைக்கடலை": "Brown Chickpeas",
    "கருப்பு கொண்டைக்கடலை": "Black Chickpeas",
    "வெள்ளை கொண்டைக்கடலை": "White Kabuli Chickpeas",
    "சுண்டல்": "Chickpeas (Sundal)",
    "தட்டப்பயறு": "Cowpeas (Thattai Payaru)",
    "காராமணி": "Cowpeas (Karamani)",
    "கொள்ளு": "Horse Gram",
    "மொச்சை": "Field Beans (Mochai)",

    # Spices, Salts & Dry Ingredients (மளிகை & மசாலா)
    "சீரகம்": "Cumin Seeds",
    "மிளகு": "Black Pepper",
    "கருப்பு மிளகு": "Black Pepper",
    "வெந்தயம்": "Fenugreek Seeds",
    "கடுகு": "Mustard Seeds",
    "சோம்பு": "Fennel Seeds",
    "பெருங்காயம்": "Pure Compounded Asafoetida",
    "பால் பெருங்காயம்": "Compound Milk Asafoetida",
    "இந்துப்பு": "Himalayan Pink Rock Salt",
    "இந்துப்பு தூள்": "Himalayan Pink Salt Powder",
    "கல் உப்பு": "Natural Sea Rock Salt",
    "தூள் உப்பு": "Natural Fine Salt",
    "ஏலக்காய்": "Green Cardamom",
    "கிராம்பு": "Cloves",
    "பட்டை": "Cinnamon Bark",
    "இலவங்கம்": "Cloves",
    "ஜாதிக்காய்": "Nutmeg",
    "அன்னாசி பூ": "Star Anise",
    "பிரிஞ்சி இலை": "Bay Leaf",
    "சுக்கு": "Dry Ginger",
    "திப்பிலி": "Long Pepper (Thippili)",
    "ஜாதிபத்திரி": "Mace",

    # Health Mixes & Flours (சத்து மாவு & அவல்)
    "சத்து மாவு": "Multi-Grain Health Mix (Sathu Maavu)",
    "தானிய சத்து மாவு": "Sprouted Millets Sathu Maavu",
    "சிவப்பு அவல்": "Red Rice Flakes (Aval)",
    "கைக்குத்தல் அவல்": "Hand Pounded Aval",
    "கம்பு அவல்": "Pearl Millet Aval",
    "ராகி அவல்": "Ragi Flakes (Aval)",
    "சோள அவல்": "Corn / Sorghum Flakes",
}

# Phonetic transliteration map for unseen Tamil character sequences
TAMIL_PHONETIC_MAP = [
    ("ஸ்ரீ", "Sri"),
    ("க்ஷ்", "ksh"),
    ("க்", "k"),
    ("ங்", "ng"),
    ("ச்", "ch"),
    ("ஞ்", "nj"),
    ("ட்", "t"),
    ("ண்", "n"),
    ("த்", "th"),
    ("ந்", "n"),
    ("ப்", "p"),
    ("ம்", "m"),
    ("ய்", "y"),
    ("ர்", "r"),
    ("ல்", "l"),
    ("வ்", "v"),
    ("ழ்", "zh"),
    ("ள்", "l"),
    ("ற்", "r"),
    ("ன்", "n"),
    ("ஜ", "ja"),
    ("ஷ", "sha"),
    ("ஸ", "sa"),
    ("ஹ", "ha"),
    ("கா", "ka"), ("கி", "ki"), ("கீ", "kee"), ("கு", "ku"), ("கூ", "koo"), ("கெ", "ke"), ("கே", "kae"), ("கை", "kai"), ("கொ", "ko"), ("கோ", "koa"), ("கௌ", "kau"), ("க", "ka"),
    ("சா", "cha"), ("சி", "chi"), ("சீ", "chee"), ("சு", "su"), ("சூ", "soo"), ("செ", "che"), ("சே", "chae"), ("சை", "sai"), ("சொ", "cho"), ("சோ", "choa"), ("சௌ", "chau"), ("ச", "cha"),
    ("டா", "ta"), ("டி", "di"), ("டீ", "dee"), ("டு", "du"), ("டூ", "doo"), ("டெ", "te"), ("டே", "tae"), ("டை", "dai"), ("டொ", "to"), ("டோ", "toa"), ("டௌ", "tau"), ("ட", "da"),
    ("தா", "tha"), ("தி", "thi"), ("தீ", "thee"), ("து", "thu"), ("தூ", "thoo"), ("தெ", "the"), ("தே", "thae"), ("தை", "thai"), ("தொ", "tho"), ("தோ", "thoa"), ("தௌ", "thau"), ("த", "tha"),
    ("நா", "na"), ("நி", "ni"), ("நீ", "nee"), ("நு", "nu"), ("நூ", "noo"), ("நெ", "ne"), ("நே", "nae"), ("நை", "nai"), ("நொ", "no"), ("நோ", "noa"), ("நௌ", "nau"), ("ந", "na"),
    ("பா", "pa"), ("பி", "pi"), ("பீ", "pee"), ("பு", "pu"), ("பூ", "poo"), ("பெ", "pe"), ("பே", "pae"), ("பை", "pai"), ("பொ", "po"), ("போ", "poa"), ("பௌ", "pau"), ("ப", "pa"),
    ("மா", "ma"), ("மி", "mi"), ("மீ", "mee"), ("மு", "mu"), ("மூ", "moo"), ("மெ", "me"), ("மே", "mae"), ("மை", "mai"), ("மொ", "mo"), ("மோ", "moa"), ("மௌ", "mau"), ("ம", "ma"),
    ("யா", "ya"), ("யி", "yi"), ("யீ", "yee"), ("யு", "yu"), ("யூ", "yoo"), ("யெ", "ye"), ("யே", "yae"), ("யை", "yai"), ("யொ", "yo"), ("யோ", "yoa"), ("யௌ", "yau"), ("ய", "ya"),
    ("ரா", "ra"), ("ரி", "ri"), ("ரீ", "ree"), ("ரு", "ru"), ("ரூ", "roo"), ("ரெ", "re"), ("ரே", "rae"), ("ரை", "rai"), ("ரொ", "ro"), ("ரோ", "roa"), ("ரௌ", "rau"), ("ர", "ra"),
    ("லா", "la"), ("லி", "li"), ("லீ", "lee"), ("லு", "lu"), ("லூ", "loo"), ("லெ", "le"), ("லே", "lae"), ("லை", "lai"), ("லொ", "lo"), ("லோ", "loa"), ("லௌ", "lau"), ("ல", "la"),
    ("வா", "va"), ("வி", "vi"), ("வீ", "vee"), ("வு", "vu"), ("வூ", "voo"), ("வெ", "ve"), ("வே", "vae"), ("வை", "vai"), ("வொ", "vo"), ("வோ", "voa"), ("வௌ", "vau"), ("வ", "va"),
    ("ழா", "zha"), ("ழி", "zhi"), ("ழீ", "zhee"), ("ழு", "zhu"), ("ழூ", "zhoo"), ("ழெ", "zhe"), ("ழே", "zhae"), ("ழை", "zhai"), ("ழொ", "zho"), ("ழோ", "zhoa"), ("ழௌ", "zhau"), ("ழ", "zha"),
    ("ளா", "la"), ("ளி", "li"), ("ளீ", "lee"), ("ளு", "lu"), ("ளூ", "loo"), ("ளெ", "le"), ("ளே", "lae"), ("ளை", "lai"), ("ளொ", "lo"), ("ளோ", "loa"), ("ளௌ", "lau"), ("ள", "la"),
    ("றா", "ra"), ("றி", "ri"), ("றீ", "ree"), ("று", "ru"), ("றூ", "roo"), ("றெ", "re"), ("றே", "rae"), ("றை", "rai"), ("றொ", "ro"), ("றோ", "roa"), ("றௌ", "rau"), ("ற", "ra"),
    ("னா", "na"), ("னி", "ni"), ("னீ", "nee"), ("னு", "nu"), ("னூ", "noo"), ("னெ", "ne"), ("னே", "nae"), ("னை", "nai"), ("னொ", "no"), ("னோ", "noa"), ("னௌ", "nau"), ("ன", "na"),
    ("அ", "A"), ("ஆ", "Aa"), ("இ", "I"), ("ஈ", "Ee"), ("உ", "U"), ("ஊ", "Oo"), ("எ", "E"), ("ஏ", "Ae"), ("ஐ", "Ai"), ("ஒ", "O"), ("ஓ", "Oa"), ("ஔ", "Au"), ("ஃ", "ak"),
]

def transliterate_tamil_to_english(text: str) -> str:
    """
    Phonetically transliterates Tamil text into readable English.
    Used when a product term isn't found in the direct dictionary.
    """
    out = text
    for tam, eng in TAMIL_PHONETIC_MAP:
        out = out.replace(tam, eng)
    # Clean up double letters and capitalize words
    words = [w.strip().capitalize() for w in out.split() if w.strip()]
    return " ".join(words)

def classify_category(tamil_name: str, english_name: str) -> str:
    """
    Categorizes the product into organic store catalog categories.
    """
    combined = f"{tamil_name} {english_name}".lower()
    
    if any(k in combined for k in ["எண்ணெய்", "நெய்", "oil", "ghee"]):
        return "Cold Pressed Oils"
    elif any(k in combined for k in ["சர்க்கரை", "வெல்லம்", "கருப்பட்டி", "கற்கண்டு", "தேன்", "sugar", "jaggery", "honey"]):
        return "Natural Sweeteners"
    elif any(k in combined for k in ["பொடி", "தூள்", "மசாலா", "காபி", "podi", "powder", "masala", "coffee", "tea"]):
        return "Traditional Powders"
    elif any(k in combined for k in ["சம்பா", "கவுனி", "தூயமல்லி", "காட்டுயானம்", "பூங்கார்", "அரிசி", "rice"]):
        return "Traditional Rice"
    elif any(k in combined for k in ["குதிரைவாலி", "சாமை", "திணை", "வரகு", "கம்பு", "ராகி", "கேழ்வரகு", "சோளம்", "millet"]):
        return "Millets & Grains"
    elif any(k in combined for k in ["பருப்பு", "பயறு", "உளுந்து", "கொண்டைக்கடலை", "சுண்டல்", "கொள்ளு", "dal", "gram", "pulse"]):
        return "Organic Pulses"
    elif any(k in combined for k in ["உப்பு", "மிளகு", "சீரகம்", "வெந்தயம்", "கடுகு", "மஞ்சள்", "ஏலக்காய்", "salt", "spice"]):
        return "Spices & Salts"
    elif any(k in combined for k in ["அவல்", "சத்து மாவு", "flour", "flakes"]):
        return "Health Mixes & Flakes"
    return "Organic Products"

def translate_product_name(raw_name: str) -> tuple[str, str, str]:
    """
    Given a raw product name (often in Tamil), returns:
    (name_ta, name_en, display_name)
    """
    cleaned = raw_name.strip(" -:,.•1234567890/\\")
    if not cleaned:
        return ("", "", "")

    # Check direct dictionary
    if cleaned in TAMIL_PRODUCT_DICTIONARY:
        en = TAMIL_PRODUCT_DICTIONARY[cleaned]
        return (cleaned, en, f"{cleaned} / {en}")

    # Check case-insensitive / partial match in dictionary
    for tam, eng in TAMIL_PRODUCT_DICTIONARY.items():
        if cleaned == tam or cleaned in tam or tam in cleaned:
            diff = cleaned.replace(tam, "").strip()
            if diff and diff in TAMIL_PRODUCT_DICTIONARY:
                extra_en = TAMIL_PRODUCT_DICTIONARY[diff]
                en = f"{eng} {extra_en}"
            elif diff:
                en = f"{eng} {transliterate_tamil_to_english(diff)}"
            else:
                en = eng
            return (cleaned, en, f"{cleaned} / {en}")

    # Check if text is predominantly Tamil
    has_tamil = any(0x0B80 <= ord(c) <= 0x0BFF for c in cleaned)
    if has_tamil:
        en = transliterate_tamil_to_english(cleaned)
        return (cleaned, en, f"{cleaned} / {en}")
    else:
        # User entered in English
        en = cleaned.title()
        # Look if reverse lookup exists
        ta = ""
        for k, v in TAMIL_PRODUCT_DICTIONARY.items():
            if en.lower() in v.lower():
                ta = k
                break
        if ta:
            return (ta, en, f"{ta} / {en}")
        return ("", en, en)

def parse_single_product_line(line: str) -> Optional[Dict[str, Any]]:
    """
    Parses a single line of raw product text.
    Handles formats like:
      - இட்லி பொடி 250 கிராம் 200
      - நாட்டு சர்க்கரை 1 கிலோ 90
      - மரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380
      - கருப்பு கவுனி அரிசி 2 kg 280
      - மஞ்சள் பொடி 100g 45
      - 1. இட்லி பொடி - 250g - ரூ.200/-
    """
    raw = line.strip()
    if not raw:
        return None

    # Strip leading bullet/numbers like "1. ", "2) ", "- ", "• "
    cleaned = re.sub(r'^(?:[0-9]+[\.\)\-:]\s*|[\-\*\•\+]\s*)', '', raw).strip()
    if not cleaned:
        return None

    # 1. Extract Price
    # Matches patterns at the end: "ரூ.200", "₹200", "200/-", "200 rs", " 200", "ரூபாய் 200"
    price = 0.0
    price_pattern = re.compile(
        r'(?:(?:ரூ\.?|ரூபாய்|rs\.?|inr|₹|விலை[:\s]*)\s*)?(\d+(?:\.\d{1,2})?)\s*(?:/\-|/=|rs|ரூ|inr)?\s*$',
        re.IGNORECASE
    )
    
    price_match = price_pattern.search(cleaned)
    if price_match:
        try:
            price = float(price_match.group(1))
            # Remove price substring from the line
            cleaned = cleaned[:price_match.start()].strip()
        except ValueError:
            price = 0.0

    # 2. Extract Unit and Quantity / Pack Size
    unit = "kg"
    extracted_qty = 1.0

    unit_regex = re.compile(
        r'(\d+(?:\.\d+)?)\s*(கிலோகிராம்கள்|கிலோகிராம்|கிலோக்கள்|கிலோ|kilograms|kilogram|kgs|kg|kilo|கிராம்கள்|கிராம்|கிரா|grams|gram|gms|gm|g|மில்லிலிட்டர்கள்|மில்லிலிட்டர்|மில்லி|மிலி|milli|ml|லிட்டர்கள்|லிட்டர்|லிட்|லி|litres|litre|liters|liter|ltr|l|பாக்கெட்டுகள்|பாக்கெட்கள்|பாக்கெட்|பாக்கட்|packets|packet|packs|pack|pkts|pkt|பாட்டில்கள்|பாட்டில்|bottles|bottle|bot|டின்கள்|டின்|tins|tin|பீஸ்கள்|பீஸ்|pieces|piece|pcs|pc|nos|no)(?=[^a-zA-Z0-9\u0B80-\u0BFF]|$)',
        re.IGNORECASE
    )

    unit_match = unit_regex.search(cleaned)
    if unit_match:
        qty_val = float(unit_match.group(1))
        unit_str = unit_match.group(2).lower()
        
        # Standardize unit for store display
        if any(u in unit_str for u in ["கிலோ", "kg", "kilo"]):
            if qty_val == 1.0:
                unit = "kg"
            else:
                unit = f"{int(qty_val) if qty_val.is_integer() else qty_val} kg"
            extracted_qty = qty_val
        elif any(u in unit_str for u in ["கிராம்", "கிரா", "gm", "g"]):
            unit = f"{int(qty_val)}g"
            extracted_qty = 1.0
        elif any(u in unit_str for u in ["லிட்டர்", "லி", "ltr", "liter", "l"]):
            if qty_val == 1.0:
                unit = "liter"
            else:
                unit = f"{int(qty_val) if qty_val.is_integer() else qty_val} liter"
            extracted_qty = qty_val
        elif any(u in unit_str for u in ["மிலி", "மில்லி", "ml"]):
            unit = f"{int(qty_val)}ml"
            extracted_qty = 1.0
        elif any(u in unit_str for u in ["பாக்கெட்", "packet", "pack", "pkt"]):
            unit = "packet"
            extracted_qty = qty_val
        elif any(u in unit_str for u in ["பாட்டில்", "bottle"]):
            unit = "bottle"
            extracted_qty = qty_val
        elif any(u in unit_str for u in ["டின்", "tin"]):
            unit = "tin"
            extracted_qty = qty_val
        else:
            unit = "piece"
            extracted_qty = qty_val

        # Remove the unit phrase from product name
        cleaned = (cleaned[:unit_match.start()] + " " + cleaned[unit_match.end():]).strip()

    # 3. Clean remaining string to get Product Name
    cleaned_name = re.sub(r'[\-:,/\\|]', ' ', cleaned).strip()
    cleaned_name = re.sub(r'\s+', ' ', cleaned_name)

    if not cleaned_name:
        return None

    name_ta, name_en, display_name = translate_product_name(cleaned_name)
    category = classify_category(name_ta or cleaned_name, name_en)

    return {
        "raw_text": raw,
        "name": display_name,
        "name_ta": name_ta or cleaned_name,
        "name_en": name_en or cleaned_name,
        "category": category,
        "unit": unit,
        "price": price,
        "stock_quantity": 100.0,
        "quantity": extracted_qty,
        "tax_percentage": 0.0,
        "description": f"Pure Natural {name_en or cleaned_name}"
    }

def parse_product_text_bulk(text: str) -> List[Dict[str, Any]]:
    """
    Parses a multi-line text input containing product details.
    Handles comma-separated, newline-separated, or semicolon-separated entries.
    """
    lines = re.split(r'[\r\n]+', text)
    results = []

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        
        # If line contains multiple items separated by comma or semicolon
        if ',' in line_clean and re.search(r'\d', line_clean):
            subparts = [p.strip() for p in line_clean.split(',') if p.strip()]
            for sub in subparts:
                item = parse_single_product_line(sub)
                if item:
                    results.append(item)
        else:
            item = parse_single_product_line(line_clean)
            if item:
                results.append(item)

    return results
