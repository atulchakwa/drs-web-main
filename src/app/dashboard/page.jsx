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
    const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: "", date: "" });
    const [modal, setModal] = useState({ show: false, type: null, data: null, isCancelling: false, cancelReason: "" });
    const [toast, setToast] = useState(null);
    const [confirmTime, setConfirmTime] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (!data.authenticated) {
                    router.push("/login");
                } else {
                    setUser(data.user);
                }
            })
            .catch(() => {
                setLoading(false);
            });
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
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            // Continue with logout anyway
        }
        router.push("/login");
    };

    const handleModalOpen = (apt) => {
        setModal({ show: true, data: apt, isCancelling: false, cancelReason: "" });
        setConfirmTime(apt.confirmedTime || "");
        setIsUpdating(false);
    };

    const updateStatus = async (id, status, extra = {}) => {
        if (isUpdating) return;

        // Optimistic UI Update
        const previousAppointments = [...appointments];
        setAppointments(prev => prev.map(apt =>
            apt._id === id ? { ...apt, status, ...extra } : apt
        ));
        setModal({ show: false, isCancelling: false, cancelReason: "" });
        showToast(`Status updating to ${status}...`);

        try {
            setIsUpdating(true);
            const body = { status, ...extra };
            if (status === 'confirmed' && confirmTime) {
                body.confirmedTime = confirmTime;
            }
            if (status === 'cancelled') {
                body.cancelledBy = 'doctor';
                if (modal.cancelReason) body.cancellationReason = modal.cancelReason;
            }

            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            
            let data;
            try {
                data = await res.json();
            } catch (err) {
                setAppointments(previousAppointments);
                showToast("Failed to update appointment", "error");
                return;
            }
            if (data.success) {
                showToast(`Appointment successfully ${status}`);
                fetchAppointments(); // Refresh to sync with server
            } else {
                // Rollback on failure
                setAppointments(previousAppointments);
                showToast(data.error || "Update failed", "error");
            }
        } catch (err) {
            console.error("Update failed:", err);
            setAppointments(previousAppointments);
            showToast("Update failed", "error");
        } finally {
            setIsUpdating(false);
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


    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-4 border ${toast.type === "error" ? "bg-white border-rose-200 text-rose-800" : "bg-white border-emerald-200 text-emerald-800"
                            }`}
                    >
                        {toast.type === "error" ? <XCircle className="w-6 h-6 text-rose-500" /> : <CheckCircle className="w-6 h-6 text-emerald-500" />}
                        <span className="font-semibold text-base">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-3 group">
                                <Activity className="w-8 h-8 text-primary-600" />
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Clinic Admin
                                </h1>
                            </Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-base font-semibold text-slate-900">{user?.email?.split('@')[0]}</span>
                                <span className="text-sm text-slate-500">{user?.email}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2.5 px-5 py-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-base font-semibold transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area - Appointments */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black text-slate-900">Appointments</h2>
                                <span className="bg-primary-100 text-primary-700 text-sm font-bold px-3 py-1 rounded-full">
                                    {appointments.length} Total
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={filter.status}
                                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                    className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer shadow-sm"
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
                                    className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer shadow-sm"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
                                <div className="w-16 h-16 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                                <p className="mt-6 text-lg font-semibold text-slate-500">Loading appointments...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 text-center px-8">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    <Calendar className="w-12 h-12 text-slate-400" />
                                </div>
                                <p className="text-xl font-bold text-slate-900 mb-2">No appointments found</p>
                                <p className="text-base text-slate-500">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {appointments.map((apt) => (
                                    <motion.div
                                        key={apt._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary-400 hover:shadow-lg transition-all flex flex-col justify-between"
                                    >
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                                    <User className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900">{apt.name}</h4>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                                                        <Phone className="w-4 h-4" />
                                                        {apt.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusBadge(apt.status)}
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-5 border border-slate-100">
                                            <div className="flex items-center justify-between font-semibold text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-primary-600" />
                                                    <span className="text-base">{apt.date}</span>
                                                </div>
                                                <span className="text-sm bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-600 font-medium">
                                                    {apt.shift}
                                                </span>
                                            </div>
                                            {apt.confirmedTime && (
                                                <div className="flex items-center gap-2 text-primary-700 font-bold bg-primary-50 px-3 py-2 rounded-lg">
                                                    <Clock className="w-4 h-4" />
                                                    Confirmed at {apt.confirmedTime}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleModalOpen(apt)}
                                            className="w-full py-3.5 bg-primary-600 text-white rounded-xl text-base font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 active:scale-[0.98]"
                                        >
                                            Manage Appointment
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side Column - Stats & Links */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-5">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2.5">
                                <Activity className="w-6 h-6 text-primary-600" />
                                Appointment Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</div>
                                    <div className="text-3xl font-black text-amber-700 mt-1">{stats.pending || 0}</div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmed</div>
                                    <div className="text-3xl font-black text-emerald-700 mt-1">{stats.confirmed || 0}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Completed</div>
                                    <div className="text-3xl font-black text-blue-700 mt-1">{stats.completed || 0}</div>
                                </div>
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Cancelled</div>
                                    <div className="text-3xl font-black text-rose-700 mt-1">{stats.cancelled || 0}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2.5">
                                <LayoutDashboard className="w-6 h-6 text-primary-600" />
                                Quick Links
                            </h3>
                            <Link href="/" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-slate-600" />
                                    <span className="font-semibold text-base text-slate-700">View Public Site</span>
                                </div>
                                <Activity className="w-5 h-5 text-slate-400" />
                            </Link>
                        </div>
                    </div>
                </div>
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-primary-50 border-b border-primary-100 p-6 flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Manage Appointment</h3>
                                    <p className="text-sm text-slate-600 mt-1">Update status and confirm scheduling</p>
                                </div>
                                <button
                                    onClick={() => setModal({ show: false, isCancelling: false })}
                                    className="p-2 hover:bg-primary-100 rounded-xl text-slate-400 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                {/* Patient Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient</div>
                                        <div className="font-bold text-slate-900 flex items-center gap-2.5 text-base">
                                            <User className="w-5 h-5 text-primary-600 shrink-0" />
                                            <span className="truncate">{modal.data.name}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact</div>
                                        <div className="font-bold text-slate-900 flex items-center gap-2.5 text-base">
                                            <Phone className="w-5 h-5 text-primary-600 shrink-0" />
                                            <a href={`tel:${modal.data.phone}`} className="hover:text-primary-600 transition truncate">{modal.data.phone || 'N/A'}</a>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date & Time</div>
                                        <div className="font-bold text-slate-900 text-base">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-primary-600 shrink-0" />
                                                {modal.data.date}
                                            </div>
                                            <div className="text-sm text-slate-500 ml-7 font-medium">{modal.data.shift}</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</div>
                                        <div className="flex items-center">{getStatusBadge(modal.data.status)}</div>
                                    </div>

                                    {modal.data.message && (
                                        <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Patient Note</div>
                                            <p className="text-sm text-slate-700 italic leading-relaxed">&ldquo;{modal.data.message}&rdquo;</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Section */}
                                <div className="border-t border-slate-200 pt-5">
                                    {modal.data.status === 'pending' && (
                                        <div className="mb-4 bg-primary-50 p-4 rounded-xl border border-primary-100 flex flex-col sm:flex-row sm:items-end gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-slate-600 uppercase mb-2 ml-1">
                                                    Assign Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={confirmTime}
                                                    onChange={(e) => setConfirmTime(e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={() => updateStatus(modal.data._id, "confirmed")}
                                                disabled={isUpdating}
                                                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-base transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {isUpdating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirm"}
                                            </button>
                                        </div>
                                    )}

                                    {modal.data.status !== 'cancelled' && modal.data.status !== 'completed' && modal.isCancelling ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4 pt-4 border-t border-slate-100"
                                        >
                                            <div className="flex items-center gap-2 text-rose-600">
                                                <AlertCircle className="w-5 h-5" />
                                                <span className="text-sm font-black uppercase tracking-wider">Confirm Cancellation</span>
                                            </div>
                                            <textarea
                                                value={modal.cancelReason}
                                                onChange={(e) => setModal({ ...modal, cancelReason: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-h-[80px] text-sm transition-all"
                                                placeholder="Reason (Optional)..."
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => updateStatus(modal.data._id, "cancelled", { cancellationReason: modal.cancelReason, cancelledBy: 'doctor' })}
                                                    disabled={isUpdating}
                                                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-lg active:scale-95"
                                                >
                                                    Confirm Cancel
                                                </button>
                                                <button
                                                    onClick={() => setModal({ ...modal, isCancelling: false })}
                                                    disabled={isUpdating}
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold py-3.5 rounded-xl text-base transition-all"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : modal.data.status === 'cancelled' || modal.data.status === 'completed' ? (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                                            <p className="text-sm font-medium text-slate-500 italic">No further actions available.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-3">
                                            {modal.data.status !== 'completed' && (
                                                <button
                                                    onClick={() => updateStatus(modal.data._id, "completed")}
                                                    disabled={isUpdating}
                                                    className="col-span-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-4 rounded-xl text-base transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    {isUpdating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Mark Completed"}
                                                </button>
                                            )}
                                            {modal.data.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => setModal({ ...modal, isCancelling: true })}
                                                    disabled={isUpdating}
                                                    className="col-span-1 bg-white border-2 border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 font-bold py-4 rounded-xl text-base transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-center items-center">
                                <p className="text-xs text-slate-400 font-medium">Click outside to dismiss</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
