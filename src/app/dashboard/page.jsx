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
        bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200",
        icon: <Clock className="w-4 h-4 mr-2" />,
        dot: "bg-amber-500"
    },
    confirmed: {
        bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200",
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
        dot: "bg-emerald-500"
    },
    completed: {
        bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200",
        icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
        dot: "bg-blue-500"
    },
    cancelled: {
        bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200",
        icon: <XCircle className="w-4 h-4 mr-2" />,
        dot: "bg-rose-500"
    },
    "no-show": {
        bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200",
        icon: <AlertCircle className="w-4 h-4 mr-2" />,
        dot: "bg-slate-500"
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot} mr-2`}></span>
                {status}
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
        <div className="min-h-screen bg-slate-50/50 selection:bg-primary-100 selection:text-primary-900 font-sans text-secondary">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`fixed top-6 right-6 px-5 py-3.5 rounded-2xl shadow-xl z-[100] flex items-center gap-3 border ${toast.type === "error" ? "bg-white border-rose-100 text-rose-800" : "bg-white border-accent-100 text-accent-800"
                            }`}
                    >
                        {toast.type === "error" ? <XCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-accent-500" />}
                        <span className="font-medium text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2 group">
                                <Activity className="w-6 h-6 text-primary-600" />
                                <h1 className="text-xl font-bold text-slate-900">
                                    Clinic Admin
                                </h1>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-semibold text-slate-900">{user?.email?.split('@')[0]}</span>
                                <span className="text-xs text-slate-500">{user?.email}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-semibold transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* Main Content Area - Appointments */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-900">Appointments</h2>
                                <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {appointments.length} Total
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filter.status}
                                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <input
                                    type="date"
                                    value={filter.date}
                                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                                <p className="mt-4 text-sm font-medium text-slate-500">Loading appointments...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 text-center px-6">
                                <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-lg font-bold text-slate-900 mb-1">No appointments found</p>
                                <p className="text-sm text-slate-500">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {appointments.map((apt) => (
                                        <motion.div
                                            key={apt._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -4 }}
                                            className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-white hover:border-primary-100 transition-all group flex flex-col justify-between"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-secondary text-lg group-hover:text-primary-700 transition-colors">{apt.name}</h4>
                                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
                                                            <Phone className="w-3 h-3" />
                                                            {apt.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(apt.status)}
                                            </div>

                                            <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3 mb-6 border border-slate-100/50 group-hover:bg-white transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center text-sm font-bold text-slate-600">
                                                        <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                                                        {apt.date}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                        {apt.shift}
                                                    </span>
                                                </div>
                                                {apt.confirmedTime ? (
                                                    <div className="flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary-200">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        CONFIRMED @ {apt.confirmedTime}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-wider italic">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Waitlisted Selection
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleModalOpen(apt)}
                                                className="w-full flex items-center justify-center gap-2 py-4 bg-secondary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-primary-600 transition-all active:scale-[0.98]"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Manage Record
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Side Column - Stats & Links */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-8 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-50 rounded-full opacity-50 blur-3xl"></div>
                            <div className="flex items-center gap-3 mb-8 relative z-10">
                                <div className="p-2 bg-primary-100 rounded-xl">
                                    <Activity className="w-5 h-5 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-secondary text-lg">Daily Performance</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 p-5 rounded-3xl shadow-sm group hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending</div>
                                        <Clock className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div className="text-3xl font-black text-amber-700">{stats.pending || 0}</div>
                                </div>
                                <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 border border-accent-200/50 p-5 rounded-3xl shadow-sm group hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Confirmed</div>
                                        <CheckCircle className="w-4 h-4 text-accent-400" />
                                    </div>
                                    <div className="text-3xl font-black text-accent-700">{stats.confirmed || 0}</div>
                                </div>
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50 p-5 rounded-3xl shadow-sm group hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Completed</div>
                                        <CheckCircle2 className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div className="text-3xl font-black text-primary-700">{stats.completed || 0}</div>
                                </div>
                                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50 p-5 rounded-3xl shadow-sm group hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Cancelled</div>
                                        <XCircle className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <div className="text-3xl font-black text-rose-700">{stats.cancelled || 0}</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                            <h3 className="font-bold text-secondary mb-4 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary-600" />
                                Quick Links
                            </h3>
                            <div className="space-y-3">
                                <Link href="/" className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                            <Globe className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <span className="font-medium text-sm text-slate-700">View Public Site</span>
                                    </div>
                                    <Activity className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal.show && modal.data && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
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
                                    <h3 className="text-xl font-bold text-secondary mb-1">Manage Appointment</h3>
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
                                        <div className="font-semibold text-secondary flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary-500" />
                                            {modal.data.name}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Contact</div>
                                        <div className="font-semibold text-secondary flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-primary-500" />
                                            {modal.data.phone || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Date & Time</div>
                                        <div className="font-semibold text-secondary flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary-500" />
                                                {modal.data.date}
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">{modal.data.shift}</div>
                                            {modal.data.preferredTime && (
                                                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex w-fit mt-1">
                                                    Preferred: {modal.data.preferredTime}
                                                </div>
                                            )}
                                            {modal.data.confirmedTime && (
                                                <div className="text-xs text-accent-600 bg-accent-50 px-2 py-1 rounded inline-flex w-fit mt-1">
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
                                    <h4 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Update Status Action</h4>

                                    {modal.data.status === 'pending' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mb-5 bg-primary-50/50 p-5 rounded-2xl border border-primary-100 shadow-sm"
                                        >
                                            <label className="flex items-center gap-2 text-sm font-bold text-primary-900 mb-3">
                                                <Clock className="w-4 h-4 text-primary-600" />
                                                Assign Specific Time (Optional)
                                            </label>
                                            <div className="bg-white border text-xl font-bold border-primary-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                                                <input
                                                    type="time"
                                                    value={confirmTime}
                                                    onChange={(e) => setConfirmTime(e.target.value)}
                                                    className="w-full px-4 py-3 text-secondary bg-transparent outline-none"
                                                />
                                            </div>
                                            <p className="text-xs font-medium text-primary-600/70 mt-2">
                                                Assigning a time will lock the slot for this patient.
                                            </p>
                                        </motion.div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {modal.data.status !== 'confirmed' && modal.data.status !== 'completed' && (
                                            <button
                                                onClick={() => updateStatus(modal.data._id, "confirmed")}
                                                className="flex-1 bg-accent-600 hover:bg-accent-700 text-white font-black text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl shadow-lg shadow-accent-200 transition-all hover:-translate-y-0.5"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        <button
                                            onClick={() => updateStatus(modal.data._id, "completed")}
                                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5"
                                        >
                                            Complete
                                        </button>
                                        <button
                                            onClick={() => updateStatus(modal.data._id, "cancelled")}
                                            className="flex-1 bg-white border-2 border-slate-100 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 font-black text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all"
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
                                    className="text-slate-500 text-sm font-bold hover:text-secondary px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors"
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
