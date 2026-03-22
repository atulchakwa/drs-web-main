"use client";

import { useState, useEffect, useCallback } from "react";

const VALID_SHIFTS = ["Morning (9 AM - 1 PM)", "Evening (4 PM - 8 PM)"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AdminDashboard() {
    const [token, setToken] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0, "no-show": 0 });
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [searchPhone, setSearchPhone] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("");
    const [newAppointment, setNewAppointment] = useState({ name: "", phone: "", date: "", shift: "", message: "", patientEmail: "" });
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const savedToken = localStorage.getItem("adminToken");
        const savedAdmin = localStorage.getItem("adminData");
        if (savedToken && savedAdmin) {
            setToken(savedToken);
            setAdmin(JSON.parse(savedAdmin));
        } else {
            window.location.href = "/admin/login";
        }
    }, []);

    const fetchAppointments = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterStatus !== "all") params.set("status", filterStatus);
            if (filterDate) params.set("date", filterDate);
            
            const res = await fetch(`/api/admin/appointments?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch:", err);
        } finally {
            setLoading(false);
        }
    }, [token, filterStatus, filterDate]);

    useEffect(() => {
        if (token) fetchAppointments();
    }, [token, fetchAppointments]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        window.location.href = "/admin/login";
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                showMessage(`Appointment ${status} successfully`, "success");
                fetchAppointments();
                setShowModal(false);
            } else {
                showMessage(data.error, "error");
            }
        } catch (err) {
            showMessage("Failed to update appointment", "error");
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return;
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showMessage("Appointment deleted", "success");
                fetchAppointments();
                setShowModal(false);
            }
        } catch (err) {
            showMessage("Failed to delete", "error");
        }
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(newAppointment)
            });
            const data = await res.json();
            if (data.success) {
                showMessage("Appointment created successfully", "success");
                setShowNewModal(false);
                setNewAppointment({ name: "", phone: "", date: "", shift: "", message: "", patientEmail: "" });
                fetchAppointments();
            } else {
                showMessage(data.error, "error");
            }
        } catch (err) {
            showMessage("Failed to create appointment", "error");
        }
    };

    const handleSendConfirmation = async (id, email) => {
        if (!email) {
            showMessage("Patient email is required to send confirmation", "error");
            return;
        }
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "confirmed", patientEmail: email })
            });
            const data = await res.json();
            if (data.success) {
                showMessage("Confirmation email sent", "success");
                fetchAppointments();
            } else {
                showMessage(data.error, "error");
            }
        } catch (err) {
            showMessage("Failed to send email", "error");
        }
    };

    const searchPatients = async () => {
        if (!searchPhone || searchPhone.length < 3) return;
        try {
            const res = await fetch(`/api/admin/patients/search?phone=${searchPhone}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.data);
            }
        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchPhone.length >= 3) searchPatients();
            else setSearchResults([]);
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchPhone]);

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    const getAppointmentsForDate = (day) => {
        if (!day) return [];
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return appointments.filter(a => a.date === dateStr);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-green-100 text-green-800",
            completed: "bg-blue-100 text-blue-800",
            cancelled: "bg-red-100 text-red-800",
            "no-show": "bg-gray-100 text-gray-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                            <span className="ml-4 text-sm text-gray-500">Dr. Rajesh Sharma Clinic</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Welcome, {admin?.name || "Admin"}</span>
                            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            {message.text && (
                <div className={`fixed top-20 right-4 px-4 py-2 rounded-lg text-white ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                                <div className="flex gap-2">
                                    <button onClick={() => setView("list")} className={`px-4 py-2 rounded-lg ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>List View</button>
                                    <button onClick={() => setView("calendar")} className={`px-4 py-2 rounded-lg ${view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>Calendar View</button>
                                </div>
                                <button onClick={() => setShowNewModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">+ New Appointment</button>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-4">
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no-show">No Show</option>
                                </select>
                                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
                                {filterDate && <button onClick={() => setFilterDate("")} className="text-sm text-blue-600">Clear Date</button>}
                            </div>

                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading...</div>
                            ) : view === "list" ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-2">Patient</th>
                                                <th className="text-left py-3 px-2">Phone</th>
                                                <th className="text-left py-3 px-2">Date</th>
                                                <th className="text-left py-3 px-2">Shift</th>
                                                <th className="text-left py-3 px-2">Status</th>
                                                <th className="text-left py-3 px-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No appointments found</td></tr>
                                            ) : appointments.map((apt) => (
                                                <tr key={apt._id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-2">{apt.name}</td>
                                                    <td className="py-3 px-2">{apt.phone}</td>
                                                    <td className="py-3 px-2">{apt.date}</td>
                                                    <td className="py-3 px-2 text-sm">{apt.shift}</td>
                                                    <td className="py-3 px-2"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>{apt.status}</span></td>
                                                    <td className="py-3 px-2">
                                                        <button onClick={() => { setSelectedAppointment(apt); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 text-sm mr-2">View</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">&lt;</button>
                                        <h3 className="text-lg font-semibold">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">&gt;</button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {DAYS.map(d => <div key={d} className="text-center font-semibold text-sm py-2 text-gray-600">{d}</div>)}
                                        {getCalendarDays().map((day, idx) => {
                                            const dayApts = getAppointmentsForDate(day);
                                            return (
                                                <div key={idx} className={`min-h-[80px] border rounded p-1 ${day ? "bg-white" : "bg-gray-50"}`}>
                                                    {day && (
                                                        <>
                                                            <div className="font-semibold text-sm">{day}</div>
                                                            {dayApts.slice(0, 2).map((apt) => (
                                                                <div key={apt._id} onClick={() => { setSelectedAppointment(apt); setShowModal(true); }} className={`text-xs p-1 rounded mt-1 cursor-pointer truncate ${getStatusColor(apt.status)}`}>
                                                                    {apt.name}
                                                                </div>
                                                            ))}
                                                            {dayApts.length > 2 && <div className="text-xs text-gray-500">+{dayApts.length - 2} more</div>}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-yellow-600">Pending</span><span className="font-bold">{stats.pending}</span></div>
                                <div className="flex justify-between"><span className="text-green-600">Confirmed</span><span className="font-bold">{stats.confirmed}</span></div>
                                <div className="flex justify-between"><span className="text-blue-600">Completed</span><span className="font-bold">{stats.completed}</span></div>
                                <div className="flex justify-between"><span className="text-red-600">Cancelled</span><span className="font-bold">{stats.cancelled}</span></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold mb-4">Search Patient</h3>
                            <div className="relative">
                                <input type="text" placeholder="Enter phone number..." value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {searchResults.map((patient) => (
                                            <div key={patient._id} onClick={() => { setSearchPhone(patient.phone); setSearchResults([]); }} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                                                <div className="font-medium">{patient.name}</div>
                                                <div className="text-sm text-gray-500">{patient.phone}</div>
                                                <div className="text-xs text-gray-400">{patient.totalAppointments} appointments</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
                        <div className="space-y-3">
                            <p><strong>Name:</strong> {selectedAppointment.name}</p>
                            <p><strong>Phone:</strong> {selectedAppointment.phone}</p>
                            <p><strong>Date:</strong> {selectedAppointment.date}</p>
                            <p><strong>Shift:</strong> {selectedAppointment.shift}</p>
                            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedAppointment.status)}`}>{selectedAppointment.status}</span></p>
                            {selectedAppointment.message && <p><strong>Message:</strong> {selectedAppointment.message}</p>}
                            {selectedAppointment.notes && <p><strong>Notes:</strong> {selectedAppointment.notes}</p>}
                        </div>
                        <div className="mt-6 space-y-2">
                            <p className="text-sm text-gray-600 mb-2">Update Status:</p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => updateAppointmentStatus(selectedAppointment._id, "confirmed")} className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm">Confirm</button>
                                <button onClick={() => updateAppointmentStatus(selectedAppointment._id, "completed")} className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm">Complete</button>
                                <button onClick={() => updateAppointmentStatus(selectedAppointment._id, "cancelled")} className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm">Cancel</button>
                                <button onClick={() => updateAppointmentStatus(selectedAppointment._id, "no-show")} className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm">No Show</button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">Send Confirmation Email:</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="patient@email.com" id="patientEmail" className="flex-1 px-3 py-1 border rounded text-sm" />
                                <button onClick={() => handleSendConfirmation(selectedAppointment._id, document.getElementById("patientEmail")?.value)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Send</button>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => handleDeleteAppointment(selectedAppointment._id)} className="text-red-600 text-sm hover:text-red-800">Delete Appointment</button>
                            <button onClick={() => setShowModal(false)} className="text-gray-600 text-sm hover:text-gray-800">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">New Appointment</h3>
                        <form onSubmit={handleCreateAppointment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                                <input type="text" required value={newAppointment.name} onChange={(e) => setNewAppointment({ ...newAppointment, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" required value={newAppointment.phone} onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Patient Email (for confirmation)</label>
                                <input type="email" value={newAppointment.patientEmail} onChange={(e) => setNewAppointment({ ...newAppointment, patientEmail: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" required value={newAppointment.date} onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shift</label>
                                <select required value={newAppointment.shift} onChange={(e) => setNewAppointment({ ...newAppointment, shift: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                    <option value="">Select shift</option>
                                    {VALID_SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
                                <textarea value={newAppointment.message} onChange={(e) => setNewAppointment({ ...newAppointment, message: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows="2" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create</button>
                                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
