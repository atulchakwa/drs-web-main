"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, HeartPulse, ShieldAlert, Activity, Baby, Contact2, Apple } from 'lucide-react';

const services = [
    {
        id: 1,
        title: 'General Checkup',
        icon: Activity,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        desc: 'Comprehensive health assessments and vitals monitoring to keep your everyday health checked.',
        details: 'Our general checkup includes a complete physical examination, blood pressure monitoring, BMI calculation, and a comprehensive review of your medical history. We focus on preventive care to catch any potential health issues before they become serious. Ideal for your annual health maintenance.'
    },
    {
        id: 2,
        title: 'Diabetes Care',
        icon: ShieldAlert,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        desc: 'Expert management plans and regular monitoring for Type 1 and Type 2 diabetes.',
        details: 'We provide specialized management for both Type 1 and Type 2 diabetes. Our care includes blood sugar tracking, HbA1c testing, personalized diet plans, and medication adjustments. We work closely with you to ensure your glucose levels remain stable and prevent long-term complications.'
    },
    {
        id: 3,
        title: 'Heart Monitoring',
        icon: HeartPulse,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        desc: 'ECG and blood pressure management to prevent and treat hypertension and cardiovascular issues.',
        details: 'Cardiovascular health is critical. We offer in-clinic ECG testing, continuous blood pressure monitoring, and hypertension management protocols. If you have a family history of heart disease or are experiencing symptoms like chest pain or shortness of breath, this service provides essential immediate insights.'
    },
    {
        id: 4,
        title: 'Pediatric Care',
        icon: Baby,
        color: 'text-sky-600',
        bgColor: 'bg-sky-50',
        desc: 'Dedicated pediatric support and vaccinations for the healthy growth of your little ones.',
        details: 'From newborn checkups to adolescent care, we provide comprehensive pediatric services. This includes standard immunization charts, growth and milestone tracking, and treatment for common childhood illnesses in a highly comforting, child-friendly environment.'
    },
    {
        id: 5,
        title: 'Geriatric Health',
        icon: Contact2,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        desc: 'Specialized healthcare focusing on the complex needs and well-being of elderly patients.',
        details: 'Elderly patients require a specialized, patient-centric approach. We focus on managing multiple chronic conditions, mobility assessments, cognitive health reviews, and medication simplification to vastly improve the quality of life for our senior patients.'
    },
    {
        id: 6,
        title: 'Nutrition Guidance',
        icon: Apple,
        color: 'text-lime-600',
        bgColor: 'bg-lime-50',
        desc: 'Personalized diet plans and nutritional counseling for optimal physical fitness and recovery.',
        details: 'Proper nutrition is often the best medicine. We provide medical nutritional therapy for weight management, chronic illness recovery (like post-surgery or during diabetes), and general wellness. Receive a customized diet plan that fits your exact lifestyle and health goals.'
    },
];

export default function ServicesGrid() {
    const [selectedService, setSelectedService] = useState(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedService) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [selectedService]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <section className="w-full relative" id="services">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-secondary tracking-tight">
                        Clinical <span className="text-primary-600">Services</span>
                    </h2>
                    <p className="text-slate-600 max-w-xl font-medium text-lg">Targeted, evidence-based treatments designed around your specific medical requirements.</p>
                </div>
                <a href="#appointment" className="group inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary-600 transition-colors bg-white border-2 border-slate-200 px-6 py-3 rounded-xl shadow-sm hover:border-primary-200 hover:bg-primary-50">
                    Book a service <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
                {services.map((service, idx) => {
                    const Icon = service.icon;
                    return (
                        <motion.div
                            variants={cardVariants}
                            key={service.id}
                            onClick={() => setSelectedService(service)}
                            className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col h-full"
                        >
                            {/* Number background */}
                            <div className="absolute top-4 right-6 text-slate-100 font-black text-6xl group-hover:text-primary-50 transition-colors duration-500 z-0">
                                0{idx + 1}
                            </div>

                            <div className={`w-14 h-14 rounded-2xl ${service.bgColor} ${service.color} flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-black/5`}>
                                <Icon className="w-7 h-7" />
                            </div>

                            <h3 className="text-2xl font-bold text-secondary mb-3 relative z-10 group-hover:text-primary-600 transition-colors">{service.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-grow relative z-10">{service.desc}</p>

                            <div className="flex items-center gap-2 mt-auto relative z-10 text-slate-400 group-hover:text-primary-600 font-bold text-sm transition-colors">
                                View details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Premium Animated Modal */}
            <AnimatePresence>
                {selectedService && (() => {
                    const ModalIcon = selectedService.icon;
                    return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            {/* Backdrop overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setSelectedService(null)}
                                className="absolute inset-0 bg-secondary/40 backdrop-blur-md cursor-pointer"
                            />

                            {/* Modal Content container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="bg-white relative z-10 w-full max-w-2xl rounded-5xl p-8 md:p-12 shadow-2xl overflow-hidden cursor-default border border-white"
                            >
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="absolute top-6 right-6 w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 hover:rotate-90 transition-all text-slate-500 z-20"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${selectedService.bgColor} ${selectedService.color} mb-8 shadow-sm border border-black/5`}>
                                    <ModalIcon className="w-10 h-10" />
                                </div>

                                <h3 className="text-3xl md:text-4xl font-black text-secondary mb-6 tracking-tight pr-10">{selectedService.title}</h3>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                                    <p className="text-slate-600 leading-relaxed font-medium text-lg">
                                        {selectedService.details}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-3 bg-primary-50 text-primary-700 px-4 py-2 rounded-xl border border-primary-100/50">
                                        <Activity className="w-5 h-5" />
                                        <span className="font-bold text-sm">20-30 mins duration</span>
                                    </div>
                                    <a
                                        href="#appointment"
                                        onClick={() => setSelectedService(null)}
                                        className="w-full sm:w-auto bg-primary-600 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary-300 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                                    >
                                        Book this Service
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

        </section>
    );
}
