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
  "Eyewear & Glasses": ["Glasses", "Eyewear", "Sunglasses", "Optical Instrument", "Frames"],
  "Clothing & Jackets": ["Clothing", "Jacket", "Apparel", "Coat", "Fabric", "Outerwear"],
  "Other": ["Personal Item", "Object", "Accessory"],
};

/**
 * Simulates Amazon Rekognition DetectLabels API.
 * Clearly tags all detected labels as isSimulated: true.
 */
export async function simulateRekognitionLabels(
  category: ItemCategory,
  title: string,
  color?: string
): Promise<DetectedLabel[]> {
  // Simulate network latency (200-400ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  const baseLabels = CATEGORY_LABEL_MAP[category] || CATEGORY_LABEL_MAP["Other"];
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
