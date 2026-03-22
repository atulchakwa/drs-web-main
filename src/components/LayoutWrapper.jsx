"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard");

    return (
        <>
            {!isDashboard && <Navbar />}
            <main className="w-full flex-1 flex flex-col items-center">
                {children}
            </main>
            {!isDashboard && <Footer />}
            {!isDashboard && <FloatingActions />}
        </>
    );
}
