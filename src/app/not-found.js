import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111] px-4">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-white mb-4">404</h1>
                <p className="text-2xl text-gray-400 mb-8">Page not found</p>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed or is temporarily unavailable.
                </p>
                <Link href="/" className="inline-block bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
