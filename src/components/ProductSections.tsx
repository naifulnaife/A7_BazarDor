
import type { Product } from "../types/product";
import ProductCard from "@/components/ProductCard";

function getChange(product: Product) {
  return Number(
    product.change?.pct ??
      product.changePercentage ??
      product.priceChange ??
      0
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="col-span-full rounded-xl bg-white p-6 text-center text-gray-500">
        এই বিভাগে কোনো পণ্য পাওয়া যায়নি।
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function ProductSections({
  products,
}: {
  products: Product[];
}) {
  const risers = [...products]
    .filter((product) => getChange(product) > 0)
    .sort((a, b) => getChange(b) - getChange(a))
    .slice(0, 6);

  const fallers = [...products]
    .filter((product) => getChange(product) < 0)
    .sort((a, b) => getChange(a) - getChange(b))
    .slice(0, 6);

  return (
    <div className="bg-linear-to-br from-emerald-50 via-green-50 to-emerald-50">
      <div className="container mx-auto space-y-12 py-10">
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
              আজ দাম বেড়েছে{" "}
              <span className="text-red-600">▲</span>
            </h2>
          </div>
          <ProductGrid products={risers} />
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
              আজ দাম কমেছে{" "}
              <span className="text-green-600">▼</span>
            </h2>
          </div>
          <ProductGrid products={fallers} />
        </section>

        <section id="সব-পণ্য" className="scroll-mt-40">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
              সব পণ্য
            </h2>
          </div>
          <ProductGrid products={products} />
        </section>
      </div>
    </div>
  );
}
