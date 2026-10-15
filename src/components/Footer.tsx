
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto container  flex flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link
            href="/"
            className="max-w-xl text-sm leading-6 text-gray-500 md:text-right" >
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </Link>
        </div>

        <p className="max-w-xl text-sm leading-6 text-gray-500 md:text-right">
          সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
        </p>
      </div>

      <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-500">
      </div>
    </footer>
  );
}
