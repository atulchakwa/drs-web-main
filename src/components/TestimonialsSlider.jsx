'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
    { id: 1, text: "Dr. Rajesh Sharma is very professional and explains the treatment clearly. Highly recommended physician. He took 30 minutes just to listen to my history.", name: "Amit Verma", time: "2 months ago" },
    { id: 2, text: "Very experienced doctor. Diagnosis is accurate and the staff is very supportive. The new clinic is beautiful and peaceful.", name: "Priya Gupta", time: "1 month ago" },
    { id: 3, text: "Clinic environment is extremely clean. The doctor listens carefully to patient problems without rushing. Truly a premium experience.", name: "Sanjay Patel", time: "3 weeks ago" },
];

export default function TestimonialsSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-24 mb-12 overflow-hidden" id="testimonials">
            <div className="flex flex-col items-center text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-medium mb-6 text-[#111] tracking-tight">Patient Experiences</h2>
                <p className="text-gray-500 font-light text-lg max-w-xl">Real stories from the people whose lives we&apos;ve helped manage and improve.</p>
            </div>

            <div className="relative h-72 md:h-64 w-full mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                    >
                        <p className="text-[#111] font-light text-2xl md:text-3xl leading-relaxed mb-10 max-w-4xl tracking-tight">&ldquo;{testimonials[current].text}&rdquo;</p>
                        <div className="flex items-center flex-col gap-2">
                            <span className="flex gap-1 text-black mb-2">★★★★★</span>
                            <h4 className="font-medium text-gray-900 text-sm tracking-wide uppercase">{testimonials[current].name}</h4>
                            <p className="text-xs text-gray-400 font-light">{testimonials[current].time}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-3">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-1.5 transition-all duration-300 rounded-full ${current === idx ? 'bg-black w-8' : 'bg-gray-200 w-4 hover:bg-gray-300'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
