"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    { id: 1, text: "Dr. Rajesh Sharma is very professional and explains the treatment clearly. Highly recommended physician. He took 30 minutes just to listen to my history.", name: "Amit Verma", time: "2 months ago", rating: 5 },
    { id: 2, text: "Very experienced doctor. Diagnosis is accurate and the staff is very supportive. The new clinic is beautiful and peaceful.", name: "Priya Gupta", time: "1 month ago", rating: 5 },
    { id: 3, text: "Clinic environment is extremely clean. The doctor listens carefully to patient problems without rushing. Truly a premium experience.", name: "Sanjay Patel", time: "3 weeks ago", rating: 5 },
    { id: 4, text: "Wait times are practically zero. I appreciate the online appointment system and the premium feel of the waiting area.", name: "Neha Singh", time: "4 days ago", rating: 5 }
];

export default function TestimonialsSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handlePrevious = () => setCurrent(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
    const handleNext = () => setCurrent(prev => prev === testimonials.length - 1 ? 0 : prev + 1);

    return (
        <section className="w-full relative py-24 overflow-hidden bg-gradient-to-b from-white to-slate-50" id="testimonials">

            {/* Background embellishments */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-amber-50 rounded-bl-full opacity-50 blur-3xl -z-10"></div>

            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-amber-100 bg-amber-50 text-amber-600 shadow-sm">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-black uppercase tracking-widest">Patient Reviews</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">Patient <span className="text-indigo-600">Experiences</span></h2>
                    <p className="text-slate-500 font-medium text-lg max-w-xl">Real stories from the people whose lives we've helped manage and improve.</p>
                </div>

                <div className="relative w-full mx-auto pb-16">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                        <Quote className="w-40 h-40 text-indigo-600" />
                    </div>

                    <div className="relative h-[280px] md:h-[220px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-12"
                            >
                                <p className="text-slate-800 font-medium text-2xl md:text-3xl leading-relaxed mb-8 max-w-4xl tracking-tight z-10 relative">
                                    &ldquo;{testimonials[current].text}&rdquo;
                                </p>

                                <div className="flex flex-col items-center gap-2 z-10">
                                    <div className="flex gap-1 text-amber-400 mb-2 drop-shadow-sm">
                                        {[...Array(testimonials[current].rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-current" />
                                        ))}
                                    </div>
                                    <h4 className="font-bold text-slate-900 tracking-wide">{testimonials[current].name}</h4>
                                    <p className="text-sm text-slate-400 font-medium">{testimonials[current].time}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 sm:px-0 pointer-events-none hidden md:flex">
                        <button onClick={handlePrevious} className="pointer-events-auto w-12 h-12 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:scale-110 hover:shadow-lg transition-all -translate-x-6 z-20">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={handleNext} className="pointer-events-auto w-12 h-12 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:scale-110 hover:shadow-lg transition-all translate-x-6 z-20">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-2 transition-all duration-500 rounded-full ${current === idx ? 'bg-indigo-600 w-8 shadow-sm shadow-indigo-200' : 'bg-slate-200 w-2 hover:bg-slate-300 hover:scale-125'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
