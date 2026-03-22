import React from 'react';

export default function ClinicTimings() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 mb-12" id="timings">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-16 grid lg:grid-cols-2 gap-16 items-center shadow-sm">

                {/* Left Side Info */}
                <div>
                    <h2 className="text-4xl md:text-5xl font-medium mb-6 text-[#111] tracking-tight">Visiting Hours</h2>
                    <p className="text-gray-500 font-light mb-10 text-lg leading-relaxed">
                        To minimize wait times, all visits are by appointment only. Emergency walk-ins are accommodated based on urgency.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm shrink-0">📍</div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">Clinic Address</h4>
                            <p className="text-gray-500 font-light text-sm">123 Health Avenue, Medical District,<br />Indore, Madhya Pradesh 452001</p>
                        </div>
                    </div>
                </div>

                {/* Right Side Schedule */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Monday - Friday</span>
                        <div className="text-right">
                            <span className="block text-gray-900 font-medium">09:00 AM - 01:00 PM</span>
                            <span className="block text-gray-500 text-sm font-light">04:00 PM - 08:00 PM</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Saturday</span>
                        <div className="text-right">
                            <span className="block text-gray-900 font-medium">09:00 AM - 02:00 PM</span>
                            <span className="block text-gray-400 text-sm font-light italic">Evening Closed</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-4">
                        <span className="font-medium text-red-500">Sunday</span>
                        <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">Closed</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
