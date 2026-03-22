"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowLeft, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) router.push("/dashboard");
            })
            .catch(() => { });
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success && res.ok) {
                router.push("/dashboard");
            } else {
                setError(data.error || "Invalid login credentials.");
            }
        } catch {
            setError("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 selection:bg-primary-100 selection:text-primary-900">

            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary-600 transition-all mb-8 uppercase tracking-[0.2em] group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Website
                </Link>

                <div className="bg-white rounded-5xl p-8 md:p-12 shadow-2xl shadow-primary-900/10 border border-slate-100 relative overflow-hidden">

                    {/* Interior gradient accent */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>

                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary-200"
                        >
                            <ShieldCheck className="w-8 h-8" />
                        </motion.div>
                        <h1 className="text-3xl font-black text-secondary tracking-tight mb-2">Admin Portal</h1>
                        <div className="h-1 w-12 bg-primary-200 rounded-full"></div>
                        <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">Secure Access Only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-600 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium placeholder:text-slate-300"
                                    placeholder="admin@clinic.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Password</label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-600 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 overflow-hidden"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white rounded-2xl py-5 font-black text-sm hover:bg-primary-700 shadow-xl shadow-primary-200 hover:shadow-primary-300 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 tracking-widest uppercase flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In to Dashboard
                                    <Loader2 className="w-4 h-4 animate-spin hidden" id="spinner-hack" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-primary-600 transition tracking-[0.2em] uppercase">
                            ← Return to Website
                        </Link>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-[10px] font-medium mt-8 tracking-widest uppercase opacity-60">
                    &copy; {new Date().getFullYear()} Dr. Rajesh Sharma Clinic. All Rights Reserved.
                </p>
            </motion.div>
        </div>
    );
}
