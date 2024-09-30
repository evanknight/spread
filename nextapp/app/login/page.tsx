"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getBaseUrl } from "@/utils/baseUrl";
import Image from "next/image";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getBaseUrl()}/app`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logos/logo-dark.png"
            alt="The Spread Logo"
            width={200}
            height={67}
            className="hidden dark:block"
          />
          <Image
            src="/images/logos/logo-light.png"
            alt="The Spread Logo"
            width={200}
            height={67}
            className="block dark:hidden"
          />
        </div>
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Login to your account
        </h3>
        <div className="mt-4">
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              {loading ? "Loading..." : "Login with Google"}
            </button>
          </div>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
