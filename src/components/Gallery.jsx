import React from 'react';
import Image from 'next/image';

export default function Gallery() {
    const images = [
        { src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600', alt: 'Clinic Reception' },
        { src: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=600', alt: 'Examination Room' },
        { src: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600', alt: 'Modern Equipment' },
    ];

    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-20" id="gallery">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-4xl md:text-5xl font-medium mb-4 text-[#1A1A1A]">Clinic Gallery</h2>
                    <p className="text-gray-500 max-w-xl font-medium">Take a look inside our state-of-the-art facility designed for your comfort and safety.</p>
                </div>
                <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-rose-500 transition border-b-2 border-transparent hover:border-rose-500 pb-1">
                    View all photos <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {images.map((img, i) => (
                    <div key={i} className="relative h-64 md:h-80 rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition duration-500">
                        <Image src={img.src} alt={img.alt} fill unoptimized className="object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                            <span className="text-white font-medium text-lg">{img.alt}</span>
                        </div>
                        <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 transform group-hover:-translate-y-1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
