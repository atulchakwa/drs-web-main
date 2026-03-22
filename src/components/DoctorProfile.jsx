"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award, Users, Star, Activity } from 'lucide-react';

export default function DoctorProfile() {
    return (
        <section className="w-full mx-auto px-4 md:px-8 py-20 relative overflow-hidden" id="doctor-profile">

            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>

            <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-indigo-900/5 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">

                {/* Internal accent gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-bl-full opacity-60"></div>

                {/* Doctor Image */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="w-full lg:w-2/5 flex justify-center lg:justify-end relative z-10"
                >
                    <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border-8 border-white group">
                        <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                        <Image
                            src="/images/doctor.jpg"
                            fill
                            unoptimized
                            className="object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                            alt="Dr. Rajesh Sharma"
                        />

                        {/* Floating mini badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-6 -left-4 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 border border-white z-20 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Board Certified</p>
                                <p className="text-[10px] font-semibold text-slate-500">Internal Medicine</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Doctor Info */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
                    className="w-full lg:w-3/5 flex flex-col justify-center text-center lg:text-left relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 self-center lg:self-start border border-indigo-100 bg-indigo-50 shadow-sm text-indigo-600">
                        <Activity className="w-4 h-4 shadow-indigo-200" />
                        <span className="text-xs font-black uppercase tracking-widest">Medical Director</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">Dr. Rajesh Sharma</h2>
                    <p className="text-xl text-indigo-600 font-bold mb-8">MD Internal Medicine • Post-Graduate from AIIMS</p>

                    <p className="text-slate-600 leading-relaxed mb-12 max-w-2xl font-medium text-lg">
                        Dr. Sharma is highly recognized for his patient-centered approach to chronic disease management, precise diagnostics, and preventive healthcare strategies. Focused entirely on patient wellness, not just symptom management. With a holistic understanding of internal health, every treatment plan is tailored to the individual.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 pt-8 border-t border-slate-100">

                        <div className="flex flex-col items-center lg:items-start group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                <Star className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <p className="text-3xl font-black text-slate-900 mb-1">15+</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Years Practice</p>
                        </div>

                        <div className="flex flex-col items-center lg:items-start group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                <Users className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <p className="text-3xl font-black text-slate-900 mb-1">10k+</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Consultations</p>
                        </div>

                        <div className="flex flex-col items-center lg:items-start group col-span-2 md:col-span-1">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                <Award className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <p className="text-3xl font-black text-slate-900 mb-1">4.9/5</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Patient Rating</p>
                        </div>

                    </div>
                </motion.div>

            </div>
        </section>
    );
}
