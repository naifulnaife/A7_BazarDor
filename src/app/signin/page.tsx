
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SigninPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("ইমেইল ও পাসওয়ার্ড দিন।");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
        return;
      }

      toast.success("লগইন সফল হয়েছে!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("লগইন করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: "google" | "github") {
    setSocialLoading(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch {
      toast.error(`${provider} দিয়ে লগইন করা যায়নি।`);
      setSocialLoading("");
    }
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          স্বাগতম!
        </h1>

        <p className="mb-6 text-center text-gray-500">
          আপনার বাজার দর অ্যাকাউন্টে লগইন করুন
        </p>

        <form onSubmit={handleSignin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="আপনার পাসওয়ার্ড"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!socialLoading}
            className="w-full rounded-lg bg-purple-700 px-4 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "লগইন হচ্ছে..." : "সাইন ইন"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">অথবা</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocial("google")}
            disabled={loading || !!socialLoading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            {socialLoading === "google"
              ? "Google-এ সংযোগ হচ্ছে..."
              : "Google দিয়ে লগইন"}
          </button>

          <button
            type="button"
            onClick={() => handleSocial("github")}
            disabled={loading || !!socialLoading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            {socialLoading === "github"
              ? "GitHub-এ সংযোগ হচ্ছে..."
              : "GitHub দিয়ে লগইন"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            href="/signup"
            className="font-semibold text-purple-700 hover:underline"
          >
            সাইন আপ করুন
          </Link>
        </p>
      </div>
    </main>
  );
}
