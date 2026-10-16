
export interface Product {
  id: number | string;
  slug?: string;

  // Product name
  name?: string;
  nameBn?: string;

  // Category
  category?: string;
  categoryNameBn?: string;
  categoryIcon?: string;

  // Unit and image
  unit?: string;
  emoji?: string;
  image?: string;

  // Actual API price fields
  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;

  // Existing price fields
  price?: number;
  currentPrice?: number;
  priceChange?: number;
  changePercentage?: number;

  // Actual API price change
  change?: {
    dir?: "up" | "down" | "same" | string;
    pct?: number;
  };

  // Market-wise prices
  markets?: {
    market: string;
    division?: string;
    min: number;
    max: number;
  }[];

  description?: string;
}
