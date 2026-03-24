'use client';

import React, { useState, useMemo } from 'react';

const SHIFT_OPTIONS = {
    'Morning (9 AM - 1 PM)': { start: 9, end: 13, type: 'morning', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
    'Evening (4 PM - 8 PM)': { start: 16, end: 20, type: 'evening', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
};

const getDayOfWeek = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
};

const isSunday = (dateStr) => getDayOfWeek(dateStr) === 'sunday';
const isSaturday = (dateStr) => getDayOfWeek(dateStr) === 'saturday';

export default function AppointmentForm() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDateValue = today.toISOString().split('T')[0];
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);
    const maxDateValue = maxDate.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        date: '',
        shift: 'Morning (9 AM - 1 PM)',
        preferredTime: '',
        message: ''
    });
    const [status, setStatus] = useState('idle');
    const [appointmentId, setAppointmentId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const clinicPhone = process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919876543210';

    const getTimeSlots = () => {
        if (!formData.shift) return [];

        const slots = [];
        const shiftInfo = SHIFT_OPTIONS[formData.shift];
        if (!shiftInfo) return [];

        const start = shiftInfo.start;
        const end = shiftInfo.end;

        for (let h = start; h < end; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const displayTime = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
                slots.push({ value: time, label: displayTime });
            }
        }
        return slots;
    };

    const timeSlots = getTimeSlots();

    const availableShifts = useMemo(() => {
        if (!formData.date) return Object.keys(SHIFT_OPTIONS);
        if (isSaturday(formData.date)) {
            return ['Morning (9 AM - 1 PM)'];
        }
        if (isSunday(formData.date)) {
            return [];
        }
        return Object.keys(SHIFT_OPTIONS);
    }, [formData.date]);

    const validatePhone = (phone) => {
        const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
        return /^[6-9]\d{9}$/.test(cleanPhone);
    };

    const validateEmail = (email) => {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;

        if (isSunday(selectedDate)) {
            setErrorMessage('Clinic is closed on Sundays. Please select another date.');
            setFormData({ ...formData, date: selectedDate, shift: '' });
            return;
        }

        setErrorMessage('');

        let newShift = formData.shift;
        if (isSaturday(selectedDate) && formData.shift === 'Evening (4 PM - 8 PM)') {
            newShift = 'Morning (9 AM - 1 PM)';
        }

        setFormData({ ...formData, date: selectedDate, shift: newShift });
    };

    const handleShiftChange = (e) => {
        const newShift = e.target.value;
        if (isSaturday(formData.date) && newShift === 'Evening (4 PM - 8 PM)') {
            setErrorMessage('Saturday clinic closes at 2 PM. Evening appointments are not available.');
            return;
        }
        setErrorMessage('');
        setFormData({ ...formData, shift: newShift, preferredTime: '' });
    };

    const handleTimeChange = (e) => {
        setFormData({ ...formData, preferredTime: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validation
        if (!formData.name.trim() || formData.name.trim().length < 2) {
            setErrorMessage('Please enter a valid name (at least 2 characters)');
            return;
        }

        if (!validatePhone(formData.phone)) {
            setErrorMessage('Please enter a valid 10-digit Indian phone number');
            return;
        }

        if (formData.email && !validateEmail(formData.email)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        if (!formData.date) {
            setErrorMessage('Please select a preferred date');
            return;
        }

        if (isSunday(formData.date)) {
            setErrorMessage('Clinic is closed on Sundays. Please select another date.');
            return;
        }

        if (!formData.shift) {
            setErrorMessage('Please select a time slot');
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch('/api/appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setAppointmentId(data.data.id);
                setStatus('success');
                // Scroll to top of form
                document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                setErrorMessage(data.error || 'Something went wrong. Please try again.');
                setStatus('error');
            }
        } catch (err) {
            console.error('Appointment submission error:', err);
            setErrorMessage('Network error. Please check your connection and try again.');
            setStatus('error');
        }
    };

    const closedMessage = isSunday(formData.date) ? 'Sunday: Clinic Closed' : null;

    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 border-t border-slate-200/60" id="appointment">
            <div className="bg-secondary rounded-[2rem] p-8 md:p-16 grid lg:grid-cols-2 gap-16 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-900/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>

                <div className="text-white relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">Request an<br />Appointment</h2>
                    <p className="text-slate-400 font-medium mb-10 max-w-md text-lg leading-relaxed">
                        Fill out the form with your preferred date and time slot. Our front desk will contact you to confirm.
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/10">
                        <h4 className="font-bold text-white/90 mb-6 tracking-wider uppercase text-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                            Clinic Schedule
                        </h4>
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                                <span className="text-slate-400 font-medium text-base">Monday - Friday</span>
                                <span className="text-white font-bold text-base">9 AM - 1 PM | 4 PM - 8 PM</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                                <span className="text-slate-400 font-medium text-base">Saturday</span>
                                <span className="text-white font-bold text-base">9 AM - 2 PM</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-rose-400/80 font-medium text-base">Sunday</span>
                                <span className="bg-rose-500/10 text-rose-400 px-4 py-1.5 rounded-lg text-sm font-bold uppercase border border-rose-500/20">Closed</span>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-slate-500 text-sm italic font-medium">Lunch break: 1 PM - 4 PM on weekdays</span>
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-white/10 pt-10">
                        <div>
                            <h4 className="font-bold text-white mb-3 tracking-wide uppercase text-sm">Emergency Contact</h4>
                            <a href={`tel:${clinicPhone}`} className="text-3xl font-black text-white hover:text-primary-400 transition underline underline-offset-8 decoration-white/20">{clinicPhone}</a>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 relative shadow-2xl z-10">
                    {status === 'success' && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 rounded-3xl flex flex-col items-center justify-center text-center p-8 border border-slate-100">
                            <div className="w-24 h-24 bg-accent text-white rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg shadow-accent/20">✓</div>
                            <h3 className="text-3xl font-black text-secondary mb-3">Appointment Requested!</h3>
                            <p className="text-slate-500 font-medium max-w-sm mb-6 text-lg">Your request has been received.</p>
                            <div className="bg-slate-50 rounded-2xl p-8 text-base text-secondary mb-8 w-full border border-slate-100">
                                <div className="flex justify-between mb-3"><span className="text-slate-400">ID:</span> <strong className="text-primary-600 text-lg">#{appointmentId?.slice(-6).toUpperCase()}</strong></div>
                                <div className="flex justify-between mb-3"><span className="text-slate-400">Date:</span> <strong className="text-lg">{formData.date}</strong></div>
                                <div className="flex justify-between mb-3"><span className="text-slate-400">Shift:</span> <strong className="text-lg">{formData.shift}</strong></div>
                                {formData.preferredTime && <div className="flex justify-between"><span className="text-slate-400">Time:</span> <strong className="text-lg">{formData.preferredTime}</strong></div>}
                            </div>
                            <p className="text-slate-500 font-medium max-w-sm mb-6">Our staff will contact you shortly to confirm your slot.</p>
                            <button onClick={() => {
                                setFormData({ name: '', phone: '', email: '', date: '', shift: 'Morning (9 AM - 1 PM)', preferredTime: '', message: '' });
                                setStatus('idle');
                            }} className="text-base font-black text-primary-600 border-b-2 border-primary-600 pb-1 hover:text-primary-700 transition">Book another</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-secondary uppercase tracking-[0.15em] ml-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base outline-none font-medium"
                                    placeholder="Enter your name"
                                    maxLength={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-secondary uppercase tracking-[0.15em] ml-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base outline-none font-medium"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-secondary uppercase tracking-[0.15em] ml-1">Email Address (Optional)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base outline-none font-medium"
                                placeholder="your@email.com (for confirmation)"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-secondary uppercase tracking-[0.15em] ml-1">Preferred Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={handleDateChange}
                                    min={minDateValue}
                                    max={maxDateValue}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base outline-none font-medium text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-secondary uppercase tracking-[0.15em] ml-1">Preferred Shift *</label>
                                {closedMessage ? (
                                    <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 text-rose-600 text-base font-bold">
                                        {closedMessage}
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={formData.shift}
                                        onChange={handleShiftChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base outline-none font-medium text-slate-700 cursor-pointer"
                                    >
                                        <option value="">Select a time slot</option>
                                        {availableShifts.map(shift => (
                                            <option key={shift} value={shift}>{shift}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-secondary uppercase tracking-[0.15em] ml-1">Preferred Time (Optional)</label>
                            <select
                                value={formData.preferredTime}
                                onChange={handleTimeChange}
                                disabled={!formData.shift || !!closedMessage}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base outline-none font-medium text-slate-700 disabled:opacity-50 cursor-pointer"
                            >
                                <option value="">Any time during {formData.shift || 'selected shift'}</option>
                                {timeSlots.map(slot => (
                                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-secondary uppercase tracking-[0.15em] ml-1">Symptoms or Notes</label>
                            <textarea
                                rows="3"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base outline-none font-medium resize-none"
                                placeholder="Briefly describe your symptoms..."
                                maxLength={500}
                            />
                        </div>

                        {errorMessage && (
                            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl px-5 py-4">
                                <p className="text-rose-600 text-base font-bold">{errorMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || isSunday(formData.date) || !formData.shift || !formData.date}
                            className="w-full bg-primary-600 text-white rounded-2xl py-5 font-black text-lg hover:bg-primary-700 shadow-xl shadow-primary-200 hover:shadow-primary-300 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-4 tracking-widest uppercase"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Book Appointment'}
                        </button>
                    </form>
                </div>
            </div>
            <p className="text-sm text-slate-400 mt-12 text-center font-medium">
                By submitting, you agree to be contacted regarding your appointment request.
            </p>
        </section>
    );
}
