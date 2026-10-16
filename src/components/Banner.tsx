
import Image from "next/image";
import Link from "next/link";

const today = new Intl.DateTimeFormat("bn-BD", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export default function Banner() {
  return (
   
    <section className="bg-linear-to-br from-emerald-50 via-green-50 to-emerald-50 px-4 py-8 sm:px-6 sm:py-12">
   
      <div className="container mx-auto  overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="grid items-center  gap-8 px-5 py-8 sm:px-8 sm:py-12 md:grid-cols-2 md:gap-10 md:px-10 lg:px-12">
     
          <div className="order-2 md:order-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 sm:text-sm">
              {today}
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              আজকের বাজারের দাম এক নজরে
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
              বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বাধিক এবং
              দামের পরিবর্তন এক জায়গায়।
            </p>

            <Link
              href="/#সব-পণ্য"
              className="mt-7 inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:px-8 sm:py-4 sm:text-base"
            >
              সব পণ্য দেখুন
              <span aria-hidden="true" className="text-xl">↓</span>
            </Link>
            
          </div>

        
          <div className="order-1 md:order-2">
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute inset-4 rounded-full" />

              <Image
                src="/bazar-hero.png"
                alt="তাজা সবজি ও নিত্যপ্রয়োজনীয় বাজারের পণ্য"
                width={700}
                height={700}
                priority
                className="relative h-64 w-full rounded-2xl object-cover sm:h-80 md:h-[420px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
