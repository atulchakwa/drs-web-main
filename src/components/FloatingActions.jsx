import React from 'react';

export default function FloatingActions() {
    return (
        <div className="fixed bottom-6 right-4 sm:right-6 lg:bottom-10 lg:right-10 z-[100] flex flex-col gap-3 items-end group/fab">
            {/* Call Button */}
            <a
                href={`tel:${process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919876543210'}`}
                className="w-12 h-12 sm:w-[52px] sm:h-[52px] bg-primary-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 group relative border-2 border-white/50"
                aria-label="Call Us"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="absolute right-full mr-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                    Call Now
                </span>
            </a>

            {/* WhatsApp Button */}
            <a
                href={`https://wa.me/${(process.env.NEXT_PUBLIC_CLINIC_PHONE || '919876543210').replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.3)] flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 group relative border-2 border-white/50"
                aria-label="Chat on WhatsApp"
            >
                <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span className="absolute right-full mr-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                    Chat Now
                </span>
            </a>

        </div>
    );
}
