'use client';

import React, { useState, useMemo } from 'react';

const CLINIC_SCHEDULE = {
    weekday: {
        morning: { start: '09:00', end: '13:00', label: 'Morning', display: '9 AM - 1 PM' },
        evening: { start: '16:00', end: '20:00', label: 'Evening', display: '4 PM - 8 PM' }
    },
    saturday: {
        morning: { start: '09:00', end: '14:00', label: 'Morning', display: '9 AM - 2 PM' }
    }
};

const SHIFT_OPTIONS = {
    'Morning (9 AM - 1 PM)': { hours: '09:00 - 13:00', type: 'morning', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
    'Evening (4 PM - 8 PM)': { hours: '16:00 - 20:00', type: 'evening', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
};

const getDayOfWeek = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
};

const isSunday = (dateStr) => getDayOfWeek(dateStr) === 'sunday';
const isSaturday = (dateStr) => getDayOfWeek(dateStr) === 'saturday';
const isWeekday = (dateStr) => {
    const day = getDayOfWeek(dateStr);
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day);
};

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
    const [errorMessage, setErrorMessage] = useState('');
    const clinicPhone = process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919876543210';

    const getTimeSlots = () => {
        if (!formData.shift) return [];

        const slots = [];
        const shiftInfo = SHIFT_OPTIONS[formData.shift];
        if (!shiftInfo) return [];

        const [startHour, startMin] = shiftInfo.hours.split(' - ')[0].split(' ')[0].split(':');
        const [endHour, endMin] = shiftInfo.hours.split(' - ')[1].split(' ')[0].split(':');

        let start = parseInt(startHour);
        const end = parseInt(endHour);
        const isPM = shiftInfo.hours.includes('PM') && end !== 12;

        if (isPM && start !== 12) start += 12;
        if (shiftInfo.hours.includes('AM') && end === 12) start += 12;

        for (let h = start; h < end; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour24 = h;
                const hour12 = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const time = `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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

    const selectedShiftInfo = SHIFT_OPTIONS[formData.shift];

    const getShiftTimeDisplay = () => {
        if (!formData.shift || !selectedShiftInfo) return '';
        return `⏰ ${selectedShiftInfo.hours}`;
    };

    const getClinicClosedMessage = () => {
        if (!formData.date) return '';
        if (isSunday(formData.date)) {
            return 'Sunday: Clinic Closed';
        }
        return null;
    };

    const validatePhone = (phone) => {
        const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
        return /^[6-9]\d{9}$/.test(cleanPhone);
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

        if (!formData.name.trim() || formData.name.trim().length < 2) {
            setErrorMessage('Please enter a valid name (at least 2 characters)');
            return;
        }

        if (!validatePhone(formData.phone)) {
            setErrorMessage('Please enter a valid 10-digit Indian phone number');
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

        setStatus('loading');
        try {
            const res = await fetch('/api/appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus('success');
                setFormData({ name: '', phone: '', email: '', date: '', shift: 'Morning (9 AM - 1 PM)', message: '' });
            } else {
                setErrorMessage(data.error || 'Something went wrong. Please try again.');
                setStatus('error');
            }
        } catch (err) {
            setErrorMessage('Network error. Please check your connection and try again.');
            setStatus('error');
        }
    };

    const closedMessage = getClinicClosedMessage();

    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 border-t border-slate-200/60" id="appointment">
            <div className="bg-secondary rounded-5xl p-8 md:p-16 grid lg:grid-cols-2 gap-16 items-center shadow-2xl relative overflow-hidden">

                {/* Subtle background glow for dark section */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-900/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>

                <div className="text-white relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">Request an<br />Appointment</h2>
                    <p className="text-slate-400 font-medium mb-8 max-w-md text-lg leading-relaxed">
                        Fill out the form with your preferred date and time slot. Our front desk will contact you to confirm.
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-white/10">
                        <h4 className="font-bold text-white mb-4 tracking-wide uppercase text-xs">Clinic Schedule</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Monday - Friday</span>
                                <span className="text-white font-bold text-right">9 AM - 1 PM | 4 PM - 8 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Saturday</span>
                                <span className="text-white font-bold text-right">9 AM - 2 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-rose-400 font-medium">Sunday</span>
                                <span className="text-rose-400 font-bold">Closed</span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs mt-4 italic font-medium">Note: Lunch break from 1 PM - 4 PM on weekdays</p>
                    </div>

                    <div className="space-y-4 border-t border-white/10 pt-8">
                        <div>
                            <h4 className="font-bold text-white mb-2 tracking-wide uppercase text-xs">Emergency Contact</h4>
                            <a href={`tel:${clinicPhone}`} className="text-2xl font-black text-white hover:text-primary-400 transition underline underline-offset-8 decoration-white/20">{clinicPhone}</a>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-10 relative shadow-2xl z-10">

                    {status === 'success' && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 rounded-3xl flex flex-col items-center justify-center text-center p-8 border border-slate-100">
                            <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg shadow-accent/20">✓</div>
                            <h3 className="text-2xl font-black text-secondary mb-2">Appointment Requested!</h3>
                            <p className="text-slate-500 font-medium max-w-sm mb-4">Your request has been received.</p>
                            <div className="bg-slate-50 rounded-2xl p-6 text-sm text-secondary mb-6 w-full border border-slate-100">
                                <div className="flex justify-between mb-2"><span className="text-slate-400">Date:</span> <strong>{formData.date}</strong></div>
                                <div className="flex justify-between mb-2"><span className="text-slate-400">Shift:</span> <strong>{formData.shift}</strong></div>
                                {formData.preferredTime && <div className="flex justify-between"><span className="text-slate-400">Time:</span> <strong>{formData.preferredTime}</strong></div>}
                            </div>
                            <p className="text-slate-500 font-medium max-w-sm mb-6">Our staff will contact you shortly to confirm your slot.</p>
                            <button onClick={() => setStatus('idle')} className="text-sm font-black text-primary-600 border-b-2 border-primary-600 pb-1 hover:text-primary-700 transition">Book another</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium placeholder:font-normal"
                                    placeholder="Enter your name"
                                    maxLength={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium placeholder:font-normal"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium placeholder:font-normal"
                                placeholder="optional@email.com"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Preferred Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={handleDateChange}
                                    min={minDateValue}
                                    max={maxDateValue}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Preferred Shift</label>
                                {closedMessage ? (
                                    <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 text-rose-600 text-sm font-bold">
                                        {closedMessage}
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={formData.shift}
                                        onChange={handleShiftChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium text-slate-700 appearance-none pointer-events-auto cursor-pointer"
                                    >
                                        <option value="">Select a time</option>
                                        {availableShifts.map(shift => (
                                            <option key={shift} value={shift}>{shift}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Preferred Slot (Optional)</label>
                            <select
                                value={formData.preferredTime}
                                onChange={handleTimeChange}
                                disabled={!formData.shift || !!closedMessage}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium text-slate-700 disabled:opacity-50 appearance-none cursor-pointer"
                            >
                                <option value="">Any time during {formData.shift || 'selected shift'}</option>
                                {timeSlots.map(slot => (
                                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Symptoms or Notes</label>
                            <textarea
                                rows="3"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm outline-none font-medium placeholder:font-normal resize-none"
                                placeholder="Briefly describe your symptoms..."
                                maxLength={500}
                            />
                        </div>

                        {errorMessage && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                                <p className="text-rose-600 text-sm font-bold">{errorMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || isSunday(formData.date) || !formData.shift || !formData.date}
                            className="w-full bg-primary-600 text-white rounded-2xl py-5 font-black text-sm hover:bg-primary-700 shadow-xl shadow-primary-200 hover:shadow-primary-300 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-2 tracking-widest uppercase"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            <p className="text-xs text-slate-400 mt-12 text-center font-medium">
                By submitting, you agree to be contacted regarding your appointment request.
            </p>
        </section>
    );
}
