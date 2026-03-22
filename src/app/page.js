import DoctorProfile from '../components/DoctorProfile';
import ServicesGrid from '../components/ServicesGrid';
import ClinicTimings from '../components/ClinicTimings';
import TestimonialsSlider from '../components/TestimonialsSlider';
import Gallery from '../components/Gallery';
import LocationMap from '../components/LocationMap';
import AppointmentForm from '../components/AppointmentForm';

export default function Home() {
  return (
    <div className="w-full px-4 md:px-8 pt-4 pb-24 flex flex-col w-full bg-[#FAFAFA] min-h-screen selection:bg-black selection:text-white">

      {/* Hero Section (Premium Minimal) */}
      <section className="relative rounded-3xl bg-white border border-gray-100 overflow-hidden px-8 py-20 md:p-24 grid lg:grid-cols-2 gap-16 min-h-[80vh] shadow-[0_4px_40px_rgba(0,0,0,0.02)] w-full mb-24">

        {/* Left Content */}
        <div className="relative z-10 flex flex-col items-start justify-center h-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border border-gray-200 bg-gray-50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">Accepting New Patients</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-medium leading-[1.05] mb-8 text-[#111] tracking-[-0.03em]">
            Premium care<br />
            for your family&apos;s<br />
            well-being.
          </h1>

          <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-12 max-w-lg font-light">
            Expert medical consultation without the wait. A highly personalized clinical experience designed around your comfort and health.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="#appointment" className="bg-black text-white px-8 py-4 rounded-full font-medium text-center hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Book Consultation
            </a>
            <a href={`tel:${process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919876543210'}`} className="bg-white text-black border border-gray-200 px-8 py-4 rounded-full font-medium text-center hover:bg-gray-50 transition-all">
              Call Clinic
            </a>
          </div>
        </div>

        {/* Right Content / Image Image */}
        <div className="relative z-10 flex justify-center items-center h-full">
          <div className="w-full h-full max-h-[600px] rounded-2xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-black/10 z-10"></div>
            <img
              src="/images/hero.jpg"
              alt="Professional Doctor"
              className="object-cover w-full h-full object-top scale-105"
              style={{ filter: 'grayscale(0.2) contrast(1.1)' }}
            />
          </div>

          {/* Subtle floating badge */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 z-20 flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-medium">
              15+
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Years of</p>
              <p className="text-sm text-gray-500">Clinical Excellence</p>
            </div>
          </div>
        </div>

      </section>

      {/* The ordered flow requested by the user */}
      <DoctorProfile />

      <div className="my-12">
        <ServicesGrid />
      </div>

      {/* Why Choose Us (Minimal Replacement for Benefits) */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24 mb-12 border-t border-gray-200/60" id="why-choose-us">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-medium mb-6 text-[#111] tracking-tight">Why Choose Our Clinic?</h2>
            <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
              We bridge the gap between traditional care and modern convenience. Experience healthcare that actually respects your time.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-black shrink-0 font-medium text-sm">01</div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Zero Waiting Time</h4>
                  <p className="text-gray-500 font-light text-sm">We strictly manage our appointment slots so you walk straight into the consultation room.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-black shrink-0 font-medium text-sm">02</div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Detailed Consultations</h4>
                  <p className="text-gray-500 font-light text-sm">We allocate 20+ minutes per patient to ensure an accurate diagnosis and comprehensive understanding.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-black shrink-0 font-medium text-sm">03</div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Direct Follow-ups</h4>
                  <p className="text-gray-500 font-light text-sm">Communicate directly with our medical staff via WhatsApp for post-visit queries and reports.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg h-[500px]">
            <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" alt="Modern Clinic" className="w-full h-full object-cover filter grayscale-[40%]" />
          </div>
        </div>
      </section>

      <AppointmentForm />
      <ClinicTimings />
      <TestimonialsSlider />

      {/* Optional: Gallery is kept minimal if needed, or removed. I'll include it. */}
      {/* <Gallery /> */}

      <LocationMap />

    </div>
  );
}