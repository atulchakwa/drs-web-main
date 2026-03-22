"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Clock, User, Phone, CheckCircle, XCircle,
    LogOut, Trash2, Edit, Activity, CheckCircle2, AlertCircle, LayoutDashboard, Globe
} from "lucide-react";

const STATUS_STYLES = {
    pending: {
        bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200",
        icon: <Clock className="w-3.5 h-3.5 mr-1.5" />
    },
    confirmed: {
        bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200",
        icon: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
    },
    completed: {
        bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
    },
    cancelled: {
        bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200",
        icon: <XCircle className="w-3.5 h-3.5 mr-1.5" />
    },
    "no-show": {
        bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200",
        icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
    }
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: "", date: "" });
    const [modal, setModal] = useState({ show: false, type: null, data: null });
    const [toast, setToast] = useState(null);
    const [confirmTime, setConfirmTime] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (!data.authenticated) router.push("/login");
                else setUser(data.user);
            })
            .catch(() => router.push("/login"));
    }, [router]);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status) params.set("status", filter.status);
            if (filter.date) params.set("date", filter.date);

            const res = await fetch(`/api/admin/appointments?${params}`);
            const data = await res.json();

            if (data.success) {
                setAppointments(data.data);
                setStats(data.stats);
            }
        } catch (err) {
            showToast("Failed to load appointments", "error");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (user) fetchAppointments();
    }, [user, fetchAppointments]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const handleModalOpen = (apt) => {
        setModal({ show: true, data: apt });
        setConfirmTime(apt.confirmedTime || "");
    };

    const updateStatus = async (id, status) => {
        try {
            const body = { status };
            if (status === 'confirmed' && confirmTime) {
                body.confirmedTime = confirmTime;
            }

            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Status updated to ${status}`);
                fetchAppointments();
                setModal({ show: false });
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Update failed", "error");
        }
    };

    const deleteAppointment = async (id) => {
        if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                showToast("Appointment deleted");
                fetchAppointments();
                setModal({ show: false });
            }
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const getStatusBadge = (status) => {
        const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} shadow-sm transition-all hover:shadow-md`}>
                {style.icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-900">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`fixed top-6 right-6 px-5 py-3.5 rounded-2xl shadow-xl z-[100] flex items-center gap-3 border ${toast.type === "error" ? "bg-white border-rose-100 text-rose-800" : "bg-white border-emerald-100 text-emerald-800"
                            }`}
                    >
                        {toast.type === "error" ? <XCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        <span className="font-medium text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-200">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                Clinic Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-100/80 rounded-full border border-slate-200">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-600">{user?.email}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* Left Column - Main Table */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">

                            {/* Table Header & Filters */}
                            <div className="p-5 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-800">Appointments</h2>
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {appointments.length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="relative">
                                        <select
                                            value={filter.status}
                                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                            className="pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={filter.date}
                                            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table Content */}
                            <div className="p-0">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
                                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Loading appointments...</p>
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Calendar className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-base font-medium text-slate-600">No appointments found</p>
                                        <p className="text-sm">Try adjusting your filters</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4">Patient</th>
                                                    <th className="px-6 py-4 hidden sm:table-cell">Contact</th>
                                                    <th className="px-6 py-4">Date & Time</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {appointments.map((apt) => (
                                                    <tr key={apt._id} className="hover:bg-indigo-50/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-slate-900">{apt.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 hidden sm:table-cell">
                                                            <div className="flex items-center text-sm font-medium text-slate-600">
                                                                <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                                                {apt.phone}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center text-sm font-semibold text-slate-800 mb-1">
                                                                <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                                                                {apt.date}
                                                            </div>
                                                            <div className="flex items-center text-xs font-medium text-slate-500">
                                                                {apt.shift}
                                                            </div>
                                                            {apt.confirmedTime && (
                                                                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100/50 text-indigo-700">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {apt.confirmedTime}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {getStatusBadge(apt.status)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleModalOpen(apt)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Manage
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Stats & Actions */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-900">Today&apos;s Overview</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                                    <div className="text-amber-600 text-xs font-bold uppercase mb-1">Pending</div>
                                    <div className="text-2xl font-black text-amber-700">{stats.pending || 0}</div>
                                </div>
                                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                                    <div className="text-emerald-600 text-xs font-bold uppercase mb-1">Confirmed</div>
                                    <div className="text-2xl font-black text-emerald-700">{stats.confirmed || 0}</div>
                                </div>
                                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                                    <div className="text-indigo-600 text-xs font-bold uppercase mb-1">Completed</div>
                                    <div className="text-2xl font-black text-indigo-700">{stats.completed || 0}</div>
                                </div>
                                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                                    <div className="text-rose-600 text-xs font-bold uppercase mb-1">Cancelled</div>
                                    <div className="text-2xl font-black text-rose-700">{stats.cancelled || 0}</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                                Quick Links
                            </h3>
                            <div className="space-y-3">
                                <Link href="/" className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                            <Globe className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="font-medium text-sm text-slate-700">View Public Site</span>
                                    </div>
                                    <Activity className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {modal.show && modal.data && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setModal({ show: false })}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Manage Appointment</h3>
                                    <p className="text-sm font-medium text-slate-500">Update status and confirm scheduling</p>
                                </div>
                                <button
                                    onClick={() => setModal({ show: false })}
                                    className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-200"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Patient Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Patient</div>
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                            <User className="w-4 h-4 text-indigo-500" />
                                            {modal.data.name}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Contact</div>
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-indigo-500" />
                                            {modal.data.phone || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Date & Time</div>
                                        <div className="font-semibold text-slate-900 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-indigo-500" />
                                                {modal.data.date}
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">{modal.data.shift}</div>
                                            {modal.data.preferredTime && (
                                                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex w-fit mt-1">
                                                    Preferred: {modal.data.preferredTime}
                                                </div>
                                            )}
                                            {modal.data.confirmedTime && (
                                                <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex w-fit mt-1">
                                                    @ {modal.data.confirmedTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Current Status</div>
                                        <div className="mt-auto mb-2">
                                            {getStatusBadge(modal.data.status)}
                                        </div>
                                    </div>

                                    {modal.data.message && (
                                        <div className="col-span-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                            <div className="text-xs font-bold text-amber-600 uppercase mb-1 tracking-wider">Patient Message</div>
                                            <p className="text-sm font-medium text-slate-700 italic">&quot;{modal.data.message}&quot;</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Section */}
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Update Status Action</h4>

                                    {modal.data.status === 'pending' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mb-5 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm"
                                        >
                                            <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-3">
                                                <Clock className="w-4 h-4 text-indigo-600" />
                                                Assign Specific Time (Optional)
                                            </label>
                                            <div className="bg-white border text-xl font-bold border-indigo-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                                <input
                                                    type="time"
                                                    value={confirmTime}
                                                    onChange={(e) => setConfirmTime(e.target.value)}
                                                    className="w-full px-4 py-3 text-slate-800 bg-transparent outline-none"
                                                />
                                            </div>
                                            <p className="text-xs font-medium text-indigo-600/70 mt-2">
                                                Assigning a time will lock the slot for this patient.
                                            </p>
                                        </motion.div>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => updateStatus(modal.data._id, "confirmed")}
                                            className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-emerald-200 transition-all hover:-translate-y-0.5"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => updateStatus(modal.data._id, "completed")}
                                            className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-blue-200 transition-all hover:-translate-y-0.5"
                                        >
                                            Mark Complete
                                        </button>
                                        <button
                                            onClick={() => updateStatus(modal.data._id, "cancelled")}
                                            className="flex-1 min-w-[120px] bg-white border-2 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 font-bold py-2.5 px-4 rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-between items-center rounded-b-3xl">
                                <button
                                    onClick={() => deleteAppointment(modal.data._id)}
                                    className="text-rose-600 text-sm font-bold hover:text-rose-800 flex items-center gap-1.5 px-3 py-1.5 hover:bg-rose-100 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Record
                                </button>
                                <button
                                    onClick={() => setModal({ show: false })}
                                    className="text-slate-500 text-sm font-bold hover:text-slate-800 px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Close Window
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
