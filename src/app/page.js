"use client";

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, PhoneCall, ShieldCheck, Clock, ArrowRight, Activity, Star } from 'lucide-react';

const DoctorProfile = dynamic(() => import('../components/DoctorProfile'), { ssr: true });
const ServicesGrid = dynamic(() => import('../components/ServicesGrid'), { ssr: true });
const ClinicTimings = dynamic(() => import('../components/ClinicTimings'), { ssr: true });
const TestimonialsSlider = dynamic(() => import('../components/TestimonialsSlider'), { ssr: false });
const Gallery = dynamic(() => import('../components/Gallery'), { ssr: false });
const LocationMap = dynamic(() => import('../components/LocationMap'), { ssr: false });
const AppointmentForm = dynamic(() => import('../components/AppointmentForm'), { ssr: true });

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="w-full bg-white selection:bg-primary-100 selection:text-primary-900 font-sans overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex flex-col justify-center pt-16 sm:pt-24 pb-12 sm:pb-20 lg:py-32 px-4 sm:px-6 lg:px-8 isolate">

        {/* Background Decorative Elements - Moved inside isolate section with lower z-index */}
        <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-50/50">
          <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-primary-200/20 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
          <div className="absolute top-[15%] right-[-10%] w-[40%] h-[40%] bg-accent-200/20 rounded-full blur-[120px] opacity-50 animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[50%] bg-primary-100/10 rounded-full blur-[120px] opacity-40"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content Area */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 glass shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                  Accepting New Patients Today
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-secondary tracking-tight leading-[1.1] mb-6">
                Premium care <br className="hidden sm:block" />
                <span className="text-gradient">
                  for your family&apos;s
                </span> <br className="hidden sm:block" />
                well-being.
              </motion.h1>

              <motion.p variants={itemVariants} className="text-base sm:text-xl text-slate-600 mb-10 max-w-xl font-medium leading-relaxed">
                Expert medical consultation without the wait. A highly personalized clinical experience designed around your comfort and health.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                <a
                  href="#appointment"
                  className="group relative inline-flex items-center justify-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden shadow-xl shadow-primary-200 transition-all hover:bg-primary-700 hover:shadow-primary-300 active:scale-95"
                >
                  <Calendar className="w-5 h-5" />
                  Book Consultation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href={`tel:${process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919876543210'}`}
                  className="group inline-flex items-center justify-center gap-3 bg-white text-secondary border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95 shadow-sm"
                >
                  <PhoneCall className="w-5 h-5 text-primary-600 group-hover:rotate-12 transition-transform" />
                  Call Clinic
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Verified Experts</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>Zero Wait Time</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content / Image Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: "spring", delay: 0.4 }}
              className="relative block mt-12 lg:mt-0 h-[350px] sm:h-[450px] lg:h-[600px] w-full"
            >
              <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-slate-100">
                <Image
                  src="/images/hero.jpg"
                  alt="Professional Doctor at Dr. Rajesh Sharma's Clinic"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent"></div>
              </div>

              {/* Floating Metric Badges */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 -left-8 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 z-20"
              >
                <div className="flex gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <div className="text-sm font-black text-secondary tracking-tight">4.9/5 Rating</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">500+ Patients</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -right-8 bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-[2.5rem] shadow-2xl shadow-primary-500/20 border-4 border-white/20 z-20 flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center text-xl font-black">
                  15+
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary-100 uppercase tracking-widest">Years of</p>
                  <p className="text-lg font-bold text-white leading-tight">Clinical<br />Excellence</p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Layer */}
      <div className="relative z-20 bg-white">
        <div className="max-w-7xl mx-auto py-10">
          <DoctorProfile />

          <div className="my-16 px-4">
            <ServicesGrid />
          </div>

          {/* Why Choose Us Section */}
          <section className="w-full px-4 md:px-8 py-24 my-12 bg-slate-50 rounded-5xl mx-4 md:mx-auto max-w-[96%] overflow-hidden border border-slate-100" id="why-choose-us">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-secondary tracking-tight">
                  Why Choose Our <span className="text-primary-600">Clinic?</span>
                </h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">
                  We bridge the gap between traditional care and modern convenience. Experience healthcare that actually respects your time.
                </p>

                <div className="space-y-8">
                  {[
                    { id: '01', title: 'Zero Waiting Time', text: 'We strictly manage our appointment slots so you walk straight into the consultation room.' },
                    { id: '02', title: 'Detailed Consultations', text: 'We allocate 20+ minutes per patient to ensure an accurate diagnosis and comprehensive understanding.' },
                    { id: '03', title: 'Direct Follow-ups', text: 'Communicate directly with our medical staff via WhatsApp for post-visit queries and reports.' }
                  ].map(item => (
                    <div key={item.id} className="flex gap-6 group items-start">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-primary-600 shrink-0 text-xl sm:text-2xl font-black group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary-100/50">
                        {item.id}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-secondary mb-2">{item.title}</h4>
                        <p className="text-slate-500 font-medium leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-5xl overflow-hidden shadow-2xl border-8 border-white h-[400px] sm:h-[600px] relative group bg-primary-50">
                <Image
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                  alt="Modern Clinic Interior"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-primary-950/10 group-hover:bg-transparent transition-colors duration-700"></div>
              </div>
            </div>
          </section>

          <AppointmentForm />

          <div className="py-12">
            <ClinicTimings />
          </div>

          <TestimonialsSlider />
          <LocationMap />
        </div>
      </div>
    </div>
  );
}