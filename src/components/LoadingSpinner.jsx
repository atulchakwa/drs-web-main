"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingSpinner({ fullScreen = false, size = "md" }) {
    const sizeClasses = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const spinner = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "py-8"}`}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full`}
            />
        </motion.div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    {spinner}
                    <p className="text-gray-500 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return spinner;
}

export function LoadingOverlay({ show }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
