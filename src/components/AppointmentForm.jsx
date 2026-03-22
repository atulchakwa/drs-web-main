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
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 border-t border-gray-200/60" id="appointment">
            <div className="bg-[#111] rounded-3xl p-8 md:p-16 grid lg:grid-cols-2 gap-16 items-center shadow-2xl">

                <div className="text-white">
                    <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-tight tracking-tight">Request an<br />Appointment</h2>
                    <p className="text-gray-400 font-light mb-8 max-w-md text-lg leading-relaxed">
                        Fill out the form with your preferred date and time slot. Our front desk will contact you to confirm.
                    </p>

                    <div className="bg-white/5 rounded-2xl p-6 mb-6">
                        <h4 className="font-medium text-white mb-4 tracking-wide">Clinic Schedule</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Monday - Friday</span>
                                <span className="text-white">9 AM - 1 PM | 4 PM - 8 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Saturday</span>
                                <span className="text-white">9 AM - 2 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-red-400">Sunday</span>
                                <span className="text-red-400">Closed</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-4 italic">Note: Lunch break from 1 PM - 4 PM on weekdays</p>
                    </div>

                    <div className="space-y-4 border-t border-white/10 pt-8">
                        <div>
                            <h4 className="font-medium text-white mb-2 tracking-wide">Emergency Contact</h4>
                            <a href={`tel:${clinicPhone}`} className="text-lg font-medium text-white hover:text-gray-300 transition underline underline-offset-4 decoration-white/30">{clinicPhone}</a>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 md:p-10 relative shadow-xl">

                    {status === 'success' && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-gray-100">
                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl mb-6">✓</div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-2">Appointment Requested!</h3>
                            <p className="text-gray-500 font-light max-w-sm mb-4">Your request has been received.</p>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 mb-6">
                                <p><strong>Date:</strong> {formData.date}</p>
                                <p><strong>Shift:</strong> {formData.shift}</p>
                                {formData.preferredTime && <p><strong>Preferred Time:</strong> {formData.preferredTime}</p>}
                            </div>
                            <p className="text-gray-500 font-light max-w-sm mb-6">Our staff will contact you shortly to confirm your slot.</p>
                            <button onClick={() => setStatus('idle')} className="text-sm font-semibold text-black border-b border-black pb-1 hover:text-gray-600 transition">Book another</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition text-sm outline-none"
                                    placeholder="Enter your name"
                                    maxLength={100}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition text-sm outline-none"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Email (for confirmation)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition text-sm outline-none"
                                placeholder="optional@email.com"
                            />
                            <p className="text-xs text-gray-400 mt-1">Receive appointment confirmation via email</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Preferred Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={handleDateChange}
                                    min={minDateValue}
                                    max={maxDateValue}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition text-sm outline-none text-gray-700"
                                />
                                {formData.date && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {isSunday(formData.date) ? '❌ Closed on Sundays' :
                                            isSaturday(formData.date) ? '📅 Saturday (Morning only)' :
                                                '📅 Weekday (Morning & Evening available)'}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Preferred Time</label>
                                {closedMessage ? (
                                    <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                                        {closedMessage}
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={formData.shift}
                                        onChange={handleShiftChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition text-sm outline-none text-gray-700"
                                    >
                                        <option value="">Select a time</option>
                                        {availableShifts.map(shift => (
                                            <option key={shift} value={shift}>{shift}</option>
                                        ))}
                                    </select>
                                )}
                                {formData.shift && selectedShiftInfo && !closedMessage && (
                                    <p className="text-xs text-green-600 mt-1">{getShiftTimeDisplay()}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Preferred Slot</label>
                                {closedMessage ? (
                                    <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                                        {closedMessage}
                                    </div>
                                ) : (
                                    <select
                                        value={formData.preferredTime}
                                        onChange={handleTimeChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition text-sm outline-none text-gray-700"
                                    >
                                        <option value="">Select a slot (optional)</option>
                                        {timeSlots.map(slot => (
                                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                                        ))}
                                    </select>
                                )}
                                {formData.shift && !closedMessage && (
                                    <p className="text-xs text-gray-400 mt-1">Optional - Our staff may adjust timing</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Reason for Visit (Optional)</label>
                            <textarea
                                rows="3"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-black focus:border-black transition text-sm outline-none resize-none"
                                placeholder="Briefly describe your symptoms or reason for visit..."
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.message.length}/500</p>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <p className="text-red-600 text-sm">{errorMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || isSunday(formData.date) || !formData.shift || !formData.date}
                            className="w-full bg-black text-white rounded-xl py-4 font-medium text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Submitting...
                                </span>
                            ) : 'Request Appointment'}
                        </button>

                        <p className="text-xs text-gray-400 text-center">
                            By submitting, you agree to be contacted regarding your appointment request.
                        </p>
                    </form>
                </div>

            </div>
        </section>
    );
}
