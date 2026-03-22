'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const services = [
    {
        id: 1,
        title: 'General Checkup',
        desc: 'Comprehensive health assessments and vitals monitoring to keep your everyday health checked.',
        details: 'Our general checkup includes a complete physical examination, blood pressure monitoring, BMI calculation, and a comprehensive review of your medical history. We focus on preventive care to catch any potential health issues before they become serious. Ideal for your annual health maintenance.'
    },
    {
        id: 2,
        title: 'Diabetes Care',
        desc: 'Expert management plans and regular monitoring for Type 1 and Type 2 diabetes.',
        details: 'We provide specialized management for both Type 1 and Type 2 diabetes. Our care includes blood sugar tracking, HbA1c testing, personalized diet plans, and medication adjustments. We work closely with you to ensure your glucose levels remain stable and prevent long-term complications.'
    },
    {
        id: 3,
        title: 'Heart Monitoring',
        desc: 'ECG and blood pressure management to prevent and treat hypertension and cardiovascular issues.',
        details: 'Cardiovascular health is critical. We offer in-clinic ECG testing, continuous blood pressure monitoring, and hypertension management protocols. If you have a family history of heart disease or are experiencing symptoms like chest pain or shortness of breath, this service provides essential immediate insights.'
    },
    {
        id: 4,
        title: 'Pediatric Care',
        desc: 'Dedicated pediatric support and vaccinations for the healthy growth of your little ones.',
        details: 'From newborn checkups to adolescent care, we provide comprehensive pediatric services. This includes standard immunization charts, growth and milestone tracking, and treatment for common childhood illnesses in a highly comforting, child-friendly environment.'
    },
    {
        id: 5,
        title: 'Geriatric Health',
        desc: 'Specialized healthcare focusing on the complex needs and well-being of elderly patients.',
        details: 'Elderly patients require a specialized, patient-centric approach. We focus on managing multiple chronic conditions, mobility assessments, cognitive health reviews, and medication simplification to vastly improve the quality of life for our senior patients.'
    },
    {
        id: 6,
        title: 'Nutrition Guidance',
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

    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 relative" id="services">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <h2 className="text-4xl md:text-5xl font-medium mb-4 text-[#111] tracking-tight">Clinical Services</h2>
                    <p className="text-gray-500 max-w-xl font-light text-lg">Targeted, evidence-based treatments designed around your specific medical requirements.</p>
                </div>
                <a href="#appointment" className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-500 transition border-b border-black hover:border-gray-500 pb-1 w-fit">
                    Book a service <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {services.map((service, idx) => (
                    <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition duration-300 group cursor-pointer relative overflow-hidden"
                    >
                        <div className="text-gray-300 font-light text-5xl mb-6 group-hover:text-black transition duration-300">
                            0{idx + 1}
                        </div>
                        <h3 className="text-xl font-medium text-[#111] mb-3">{service.title}</h3>
                        <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">{service.desc}</p>
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition duration-300">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Animated Modal */}
            <AnimatePresence>
                {selectedService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setSelectedService(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                        />

                        {/* Modal Content container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white relative z-10 w-full max-w-2xl rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden cursor-default"
                        >
                            <button
                                onClick={() => setSelectedService(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-800 z-20"
                                aria-label="Close modal"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>

                            <div className="inline-block text-gray-300 font-light text-6xl mb-4">
                                0{services.findIndex(s => s.id === selectedService.id) + 1}
                            </div>

                            <h3 className="text-3xl md:text-4xl font-medium text-[#111] mb-6 tracking-tight pr-10">{selectedService.title}</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-lg md:text-xl mb-10">
                                {selectedService.details}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-8 gap-4">
                                <p className="text-sm text-gray-400 font-light italic">Consultation approx. 20-30 mins</p>
                                <a
                                    href="#appointment"
                                    onClick={() => setSelectedService(null)}
                                    className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-lg text-center"
                                >
                                    Book this Service
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </section>
    );
}
