
export interface Product {
  id: number;
  slug?: string;
  nameBn?: string;
  name?: string;
  category?: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  unit?: string;
  image?: string;
  emoji?: string;

  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;

  currentPrice?: number;
  price?: number;
  priceChange?: number;
  changePercentage?: number;

  change?: {
    dir?: string;
    pct?: number;
  };

  markets?: {
    market: string;
    division: string;
    min: number;
    max: number;
  }[];
}
