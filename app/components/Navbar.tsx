"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">NN</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">
                Heuristic Evaluator
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/"
                className={`text-sm ${
                  pathname === "/"
                    ? "text-indigo-600 font-medium"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Finding
          </Link>
        </div>
      </div>
    </nav>
  );
}
