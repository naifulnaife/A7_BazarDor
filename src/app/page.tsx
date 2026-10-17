
import Banner from "@/components/Banner";
import ProductSections from "@/components/ProductSections";
import type { Product } from "../types/product";

const API_BASE =
  process.env.NEXT_PUBLIC_BAZARDOR_API_URL ||
  "https://openapi.programming-hero.com/api/bazardor";

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const result = await response.json();

    // Support different API response formats.
    const data = Array.isArray(result)
      ? result
      : Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.products)
          ? result.products
          : Array.isArray(result.data?.products)
            ? result.data.products
            : [];

    return data;
  } catch (error) {
    console.error("Product API error:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div>
      <Banner />

      <ProductSections products={products} />
    </div>
  );
}
