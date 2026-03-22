import React from 'react';

export default function DoctorProfile() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 my-20" id="doctor-profile">
            <div className="bg-white rounded-3xl p-8 md:p-16 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row items-center gap-16 group">

                {/* Doctor Image */}
                <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-lg border-4 border-white transform transition duration-700 hover:scale-[1.02]">
                        <img src="/images/doctor.jpg" className="w-full h-full object-cover object-top filter grayscale-[20%] contrast-110" alt="Dr. Rajesh Sharma" />
                    </div>
                </div>

                {/* Doctor Info */}
                <div className="w-full lg:w-2/3 flex flex-col justify-center text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 self-center lg:self-start border border-gray-200 bg-gray-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                        <span className="text-[10px] font-semibold text-gray-800 uppercase tracking-widest">Medical Director</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-medium mb-3 text-[#111] tracking-tight">Dr. Rajesh Sharma</h2>
                    <p className="text-lg text-gray-500 font-light mb-8">MD Internal Medicine • Post-Graduate from AIIMS</p>

                    <p className="text-gray-600 leading-relaxed mb-10 max-w-2xl font-light text-lg">
                        Dr. Sharma is highly recognized for his patient-centered approach to chronic disease management, precise diagnostics, and preventive healthcare strategies. Focused entirely on patient wellness, not just symptom management.
                    </p>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-gray-100 pt-8">
                        <div>
                            <p className="text-3xl font-medium text-[#111] mb-1">15+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Years Practice</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                        <div>
                            <p className="text-3xl font-medium text-[#111] mb-1">10k+</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Consultations</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                        <div>
                            <p className="text-3xl font-medium text-[#111] mb-1">4.9/5</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Patient Rating</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
