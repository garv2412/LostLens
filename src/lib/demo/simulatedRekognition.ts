import { DetectedLabel, ItemCategory } from "../types/listing";

const CATEGORY_LABEL_MAP: Record<ItemCategory, string[]> = {
  "Bags & Backpacks": ["Backpack", "Bag", "Luggage", "Canvas", "Accessory", "Shoulder Bag"],
  "Water Bottles & Drinkware": ["Water Bottle", "Bottle", "Flask", "Drinkware", "Vacuum Bottle", "Container"],
  "Earbuds & Headphones": ["Headphones", "Earbuds", "Audio", "Electronics", "Wireless Earphones"],
  "Electronics & Laptops": ["Laptop", "Computer", "Electronics", "Screen", "Hardware", "Keyboard"],
  "Books & Notebooks": ["Book", "Textbook", "Notebook", "Publication", "Paper", "Folder"],
  "Keys & Keychains": ["Key", "Keychain", "Car Key", "Ring", "Accessory", "Remote Control"],
  "Umbrellas & Rainwear": ["Umbrella", "Rainwear", "Canopy", "Weather Gear", "Accessory"],
  "Chargers & Cables": ["Charger", "Cable", "Power Adapter", "Electronics", "USB Cable", "Wire"],
  "Sports & Fitness": ["Footwear", "Shoe", "Sneaker", "Sports Equipment", "Athletic Gear"],
  "Jewelry & Watches": ["Watch", "Wristwatch", "Jewelry", "Accessory", "Bracelet", "Metallic"],
  "Wallets & Cards": ["Wallet", "Leather", "Purse", "Pocketbook", "Accessory"],
  "Eyewear & Glasses": ["Sunglasses", "Glasses", "Eyewear", "Optical Instrument", "Frames"],
  "Clothing & Jackets": ["Clothing", "Jacket", "Apparel", "Coat", "Fabric", "Outerwear"],
  "Other": ["Personal Item", "Object", "Accessory"],
};

export interface KeywordCategoryRule {
  keywords: string[];
  category: ItemCategory;
  primaryLabels: string[];
}

export const KEYWORD_CATEGORY_RULES: KeywordCategoryRule[] = [
  {
    keywords: ["sunglass", "sunglasses", "glasses", "shades", "eyewear", "spectacles", "rayban", "ray-ban", "frames", "aviator", "wayfarer", "oakley"],
    category: "Eyewear & Glasses",
    primaryLabels: ["Sunglasses", "Glasses", "Eyewear", "Optical Instrument", "Frames"],
  },
  {
    keywords: ["headphone", "headphones", "earbud", "earbuds", "earphone", "earphones", "airpod", "airpods", "audio", "sony wh", "bose", "beats"],
    category: "Earbuds & Headphones",
    primaryLabels: ["Headphones", "Earbuds", "Audio", "Electronics", "Wireless Earphones"],
  },
  {
    keywords: ["laptop", "macbook", "thinkpad", "dell xps", "chromebook", "computer", "ipad", "tablet", "surface", "keyboard", "mouse"],
    category: "Electronics & Laptops",
    primaryLabels: ["Laptop", "Computer", "Electronics", "Screen", "Hardware"],
  },
  {
    keywords: ["bottle", "hydro flask", "hydroflask", "yeti", "stanley", "flask", "thermos", "tumbler", "drinkware", "water bottle"],
    category: "Water Bottles & Drinkware",
    primaryLabels: ["Water Bottle", "Bottle", "Flask", "Drinkware", "Container"],
  },
  {
    keywords: ["key", "keys", "keychain", "car key", "fob", "key fob", "lanyard"],
    category: "Keys & Keychains",
    primaryLabels: ["Key", "Keychain", "Car Key", "Accessory", "Ring"],
  },
  {
    keywords: ["wallet", "cardholder", "purse", "billfold", "credit card", "id card", "student id", "badge"],
    category: "Wallets & Cards",
    primaryLabels: ["Wallet", "Leather", "Accessory", "Pocketbook", "Purse"],
  },
  {
    keywords: ["umbrella", "parasol", "raincoat", "poncho", "rainwear"],
    category: "Umbrellas & Rainwear",
    primaryLabels: ["Umbrella", "Rainwear", "Canopy", "Weather Gear"],
  },
  {
    keywords: ["charger", "cable", "adapter", "power adapter", "power cord", "usb", "lightning cable", "magsafe"],
    category: "Chargers & Cables",
    primaryLabels: ["Charger", "Cable", "Power Adapter", "Electronics", "USB Cable"],
  },
  {
    keywords: ["watch", "wristwatch", "apple watch", "smartwatch", "rolex", "casio", "bracelet", "necklace", "ring", "earring", "jewelry"],
    category: "Jewelry & Watches",
    primaryLabels: ["Watch", "Wristwatch", "Jewelry", "Accessory", "Metallic"],
  },
  {
    keywords: ["shoe", "shoes", "sneaker", "sneakers", "boots", "cleats", "football", "basketball", "gym bag"],
    category: "Sports & Fitness",
    primaryLabels: ["Footwear", "Shoe", "Sneaker", "Sports Equipment", "Athletic Gear"],
  },
  {
    keywords: ["book", "textbook", "notebook", "binder", "folder", "diary", "planner", "spiral"],
    category: "Books & Notebooks",
    primaryLabels: ["Book", "Textbook", "Notebook", "Publication", "Paper"],
  },
  {
    keywords: ["backpack", "bag", "rucksack", "knapsack", "tote", "duffel", "duffle", "luggage", "jansport", "herschel"],
    category: "Bags & Backpacks",
    primaryLabels: ["Backpack", "Bag", "Luggage", "Canvas", "Accessory"],
  },
  {
    keywords: ["jacket", "hoodie", "coat", "sweater", "sweatshirt", "fleece", "shirt", "scarf", "gloves", "beanie", "hat", "cap"],
    category: "Clothing & Jackets",
    primaryLabels: ["Clothing", "Jacket", "Apparel", "Coat", "Outerwear"],
  },
];

/**
 * Automatically infers the most likely item category based on title, description, or filename.
 */
export function inferCategoryFromText(text: string): ItemCategory | null {
  if (!text || !text.trim()) return null;
  const lower = text.toLowerCase();

  for (const rule of KEYWORD_CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }
  return null;
}

/**
 * Simulates Amazon Rekognition DetectLabels API.
 * Infers labels using both the assigned category and semantic keywords in the title/brand.
 * Clearly tags all detected labels as isSimulated: true.
 */
export async function simulateRekognitionLabels(
  category: ItemCategory,
  title: string,
  color?: string
): Promise<DetectedLabel[]> {
  // Simulate network latency (200-400ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  const textToInspect = `${title} ${category}`.toLowerCase();
  
  // Check if title specifically matches a known item pattern (e.g., "Rayban sunglasses")
  let matchedRule: KeywordCategoryRule | undefined;
  for (const rule of KEYWORD_CATEGORY_RULES) {
    if (rule.keywords.some((kw) => textToInspect.includes(kw))) {
      matchedRule = rule;
      break;
    }
  }

  const baseLabels = matchedRule
    ? matchedRule.primaryLabels
    : CATEGORY_LABEL_MAP[category] || CATEGORY_LABEL_MAP["Other"];

  const selectedLabels = baseLabels.slice(0, 4);

  const detected: DetectedLabel[] = selectedLabels.map((name, index) => ({
    name,
    confidence: Math.round((99.5 - index * 2.8) * 10) / 10,
    isSimulated: true,
  }));

  if (color && color.trim().length > 0) {
    detected.push({
      name: color.trim().charAt(0).toUpperCase() + color.trim().slice(1),
      confidence: 88.5,
      isSimulated: true,
    });
  }

  return detected;
}
