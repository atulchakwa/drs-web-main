"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, PhoneCall, ShieldCheck, Clock, ArrowRight, Activity, Star } from 'lucide-react';
import DoctorProfile from '../components/DoctorProfile';
import ServicesGrid from '../components/ServicesGrid';
import ClinicTimings from '../components/ClinicTimings';
import TestimonialsSlider from '../components/TestimonialsSlider';
import Gallery from '../components/Gallery';
import LocationMap from '../components/LocationMap';
import AppointmentForm from '../components/AppointmentForm';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden font-sans">

      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8">

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[40%] bg-emerald-200/40 rounded-full blur-3xl opacity-70 animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px]"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Content Area */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center lg:items-start text-center lg:text-left pt-10"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-white/60 bg-white/70 backdrop-blur-md shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-indigo-950">
                  Accepting New Patients Today
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6 drop-shadow-sm">
                Premium care <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  for your family's
                </span> <br className="hidden sm:block" />
                well-being.
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-600 mb-10 max-w-xl font-medium leading-relaxed">
                Expert medical consultation without the wait. A highly personalized clinical experience designed around your comfort and health.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                <a
                  href="#appointment"
                  className="group relative inline-flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden shadow-lg shadow-indigo-300 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-400 active:scale-95"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <Calendar className="w-5 h-5" />
                  Book Consultation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href={`tel:${process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919876543210'}`}
                  className="group inline-flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95 shadow-sm"
                >
                  <PhoneCall className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform" />
                  Call Clinic
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 flex items-center gap-6 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Verified Experts</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Zero Wait Time</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content / Image Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.3 }}
              className="relative hidden lg:block h-[650px] w-full"
            >
              {/* Decorative Circle Behind Image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-indigo-100 to-emerald-50 rounded-full opacity-60 blur-2xl -z-10"></div>

              <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border-[6px] border-white/60 bg-white">
                <Image
                  src="/images/hero.jpg"
                  alt="Professional Doctor"
                  fill
                  unoptimized
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Floating Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              </div>

              {/* Floating Review Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 -left-8 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-white flex flex-col gap-2 z-20"
              >
                <div className="flex gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div className="text-sm font-bold text-slate-800">4.9/5 Average Rating</div>
                <div className="text-xs font-semibold text-slate-500">From 500+ Patients</div>
              </motion.div>

              {/* Floating Experience Badge */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -right-8 bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-3xl shadow-2xl shadow-indigo-600/30 border-4 border-white/20 z-20 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                  15+
                </div>
                <div>
                  <p className="text-sm font-black text-white/80 uppercase tracking-wider">Years of</p>
                  <p className="text-base font-bold text-white">Clinical Excellence</p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Structured Components Layer */}
      <div className="relative z-20 bg-white">
        {/* Subtle top border/shadow transition */}
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-slate-50 to-white -translate-y-full"></div>

        <div className="max-w-7xl mx-auto">
          <DoctorProfile />

          <div className="my-16 px-4">
            <ServicesGrid />
          </div>

          {/* Why Choose Us Minimal Update */}
          <section className="w-full px-4 md:px-8 py-24 my-12 bg-slate-50 rounded-[3rem] mx-4 md:mx-auto max-w-[96%] relative overflow-hidden" id="why-choose-us">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
                  Why Choose Our <span className="text-indigo-600">Clinic?</span>
                </h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">
                  We bridge the gap between traditional care and modern convenience. Experience healthcare that actually respects your time.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0 font-bold group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-indigo-100">01</div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Zero Waiting Time</h4>
                      <p className="text-slate-600 font-medium">We strictly manage our appointment slots so you walk straight into the consultation room.</p>
                    </div>
                  </div>
                  <div className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0 font-bold group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-indigo-100">02</div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Detailed Consultations</h4>
                      <p className="text-slate-600 font-medium">We allocate 20+ minutes per patient to ensure an accurate diagnosis and comprehensive understanding.</p>
                    </div>
                  </div>
                  <div className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0 font-bold group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-indigo-100">03</div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Direct Follow-ups</h4>
                      <p className="text-slate-600 font-medium">Communicate directly with our medical staff via WhatsApp for post-visit queries and reports.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white h-[600px] relative group">
                <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
                <Image src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" alt="Modern Clinic" fill unoptimized className="object-cover transform group-hover:scale-105 transition-transform duration-1000" />

                {/* Overlay card */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl z-20 shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-bold text-slate-900">Modern Facilities</h4>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Equipped with the latest diagnostic tools for accurate assessments.</p>
                </div>
              </div>
            </div>
          </section>

          <AppointmentForm />

          <div className="py-12 bg-white">
            <ClinicTimings />
          </div>

          <TestimonialsSlider />
          <LocationMap />
        </div>
      </div>
    </div>
  );
}