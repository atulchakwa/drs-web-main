import React from 'react';
import { Clock, MapPin, Calendar, BellRing } from 'lucide-react';

export default function ClinicTimings() {
    return (
        <section className="w-full relative" id="timings">
            <div className="bg-white rounded-5xl p-6 md:p-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start border border-slate-100 shadow-2xl shadow-primary-900/5 relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                {/* Left Side Info */}
                <div className="relative z-10 w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-primary-100 bg-primary-50 text-primary-600 shadow-sm">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Opening Hours</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-secondary tracking-tight">Visiting <span className="text-primary-600">Hours</span></h2>
                    <p className="text-slate-600 font-medium mb-10 text-lg leading-relaxed max-w-lg">
                        To minimize wait times, all visits are by appointment only. Emergency walk-ins are accommodated based on urgency and schedule availability.
                    </p>

                    <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-6 border border-primary-100 flex items-start gap-5 shadow-sm">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-50 shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-secondary mb-2 text-lg uppercase tracking-tight">Clinic Address</h4>
                            <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                123 Health Avenue, Medical District,<br />
                                Indore, Madhya Pradesh 452001
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side Schedule */}
                <div className="relative z-10 w-full bg-white sm:bg-slate-50/50 rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/60 transition-all duration-300">
                    <h3 className="text-2xl font-bold text-secondary mb-8 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary-600" />
                        Weekly Schedule
                    </h3>

                    <div className="space-y-1">
                        {/* Monday - Friday */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 border-b border-slate-200/60 group gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent group-hover:scale-125 transition-transform shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                <span className="font-bold text-secondary text-lg whitespace-nowrap">Monday - Friday</span>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto space-y-2">
                                <span className="block text-secondary font-bold bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sm sm:text-base">09:00 AM - 01:00 PM</span>
                                <span className="block text-secondary font-bold bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sm sm:text-base">04:00 PM - 08:00 PM</span>
                            </div>
                        </div>

                        {/* Saturday */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 border-b border-slate-200/60 group gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 group-hover:scale-125 transition-transform shrink-0 shadow-[0_0_10px_rgba(83,109,230,0.3)]"></div>
                                <span className="font-bold text-secondary text-lg whitespace-nowrap">Saturday</span>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto">
                                <span className="block text-secondary font-bold bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sm sm:text-base">09:00 AM - 02:00 PM</span>
                                <span className="block text-slate-400 text-[10px] font-black uppercase mt-2 tracking-widest pl-1">Evening Closed</span>
                            </div>
                        </div>

                        {/* Sunday */}
                        <div className="flex justify-between items-center py-5 group">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.3)]"></div>
                                <span className="font-bold text-secondary text-lg whitespace-nowrap">Sunday</span>
                            </div>
                            <span className="bg-rose-50 text-rose-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">Closed</span>
                        </div>
                    </div>

                    {/* Lunch Break Alert */}
                    <div className="mt-8 flex items-center gap-4 bg-amber-50/80 backdrop-blur-sm px-5 py-4 rounded-2xl border border-amber-100/50 shadow-sm">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-50 shrink-0">
                            <BellRing className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest mb-0.5">Daily Update</span>
                            <span className="text-sm font-bold text-amber-900 leading-tight">Lunch Break: 1:00 PM to 4:00 PM daily</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
