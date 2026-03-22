'use client';

import Link from 'next/link';

export default function Error({ error, reset }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111] px-4">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-white mb-4">500</h1>
                <p className="text-2xl text-gray-400 mb-8">Something went wrong</p>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    We apologize for the inconvenience. Please try again or return to the homepage.
                </p>
                <button 
                    onClick={reset}
                    className="inline-block bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition mr-4"
                >
                    Try Again
                </button>
                <Link href="/" className="inline-block bg-transparent border border-white/20 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
