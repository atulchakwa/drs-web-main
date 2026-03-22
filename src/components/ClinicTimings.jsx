import React from 'react';
import { Clock, MapPin, Calendar, BellRing } from 'lucide-react';

export default function ClinicTimings() {
    return (
        <section className="w-full relative" id="timings">
            <div className="bg-white rounded-[3rem] p-8 md:p-16 grid lg:grid-cols-2 gap-16 items-center border border-slate-100 shadow-2xl shadow-indigo-900/5 relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                {/* Left Side Info */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Opening Hours</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">Visiting <span className="text-indigo-600">Hours</span></h2>
                    <p className="text-slate-600 font-medium mb-12 text-lg leading-relaxed">
                        To minimize wait times, all visits are by appointment only. Emergency walk-ins are accommodated based on urgency and schedule availability.
                    </p>

                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] p-6 border border-indigo-100 flex items-start gap-5 mb-8 shadow-sm">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2 text-lg">Clinic Address</h4>
                            <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                123 Health Avenue, Medical District,<br />
                                Indore, Madhya Pradesh 452001
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side Schedule */}
                <div className="relative z-10 bg-slate-50 rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-inner">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        Weekly Schedule
                    </h3>

                    <div className="space-y-2">
                        {/* Weekdays */}
                        <div className="flex justify-between items-center py-5 border-b border-slate-200/60 group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
                                <span className="font-bold text-slate-800 text-lg">Monday - Friday</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-slate-900 font-bold bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm mb-1">09:00 AM - 01:00 PM</span>
                                <span className="block text-slate-900 font-bold bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">04:00 PM - 08:00 PM</span>
                            </div>
                        </div>

                        {/* Saturday */}
                        <div className="flex justify-between items-center py-5 border-b border-slate-200/60 group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                                <span className="font-bold text-slate-800 text-lg">Saturday</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-slate-900 font-bold bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">09:00 AM - 02:00 PM</span>
                                <span className="block text-slate-500 text-xs font-bold uppercase mt-2 tracking-wider">Evening Closed</span>
                            </div>
                        </div>

                        {/* Sunday */}
                        <div className="flex justify-between items-center py-5 group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500 group-hover:scale-150 transition-transform"></div>
                                <span className="font-bold text-slate-800 text-lg">Sunday</span>
                            </div>
                            <span className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm">Closed</span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 bg-amber-50 text-amber-700 px-5 py-3 rounded-xl border border-amber-200/50">
                        <BellRing className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-bold">Lunch Break: 1:00 PM to 4:00 PM daily</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
