"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/dashboard");

    return (
        <>
            {!isAuthPage && <Navbar />}
            <main className="w-full flex-1 flex flex-col items-center">
                {children}
            </main>
            {!isAuthPage && <Footer />}
            {!isAuthPage && <FloatingActions />}
        </>
    );
}
