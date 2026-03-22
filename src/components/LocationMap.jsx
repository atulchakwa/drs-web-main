import React from 'react';

export default function LocationMap() {
    return (
        <section className="w-full max-w-7xl mx-auto py-24 border-t border-gray-200/60" id="location">
            <div className="px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-medium mb-4 text-[#111] tracking-tight">Visit The Clinic</h2>
                        <p className="text-gray-500 max-w-xl font-light text-lg">Centrally located with ample parking space and full wheelchair accessibility.</p>
                    </div>
                    <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-500 transition border-b border-black hover:border-gray-500 pb-1 w-fit">
                        Get Directions <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </a>
                </div>
            </div>

            <div className="w-full h-[500px] bg-gray-100 grayscale-[0.8] contrast-125 relative">
                <iframe
                    src="https://www.google.com/maps?q=Indore%20Madhya%20Pradesh&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </section>
    );
}
