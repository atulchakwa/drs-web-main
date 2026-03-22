import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingActions from "../components/FloatingActions";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  /* ... existing metadata ... */
  title: "Premium Medical Clinic | Dr. Rajesh Sharma",
  description: "Expert internal medicine and family care in Indore. Zero waiting times and highly personalized treatments. Book your consultation today.",
  keywords: "clinic, medical center, physician indore, dr rajesh sharma, internal medicine",
  openGraph: {
    title: "Premium Medical Clinic | Dr. Rajesh Sharma",
    description: "Expert internal medicine and family care. Book your consultation.",
    url: "https://yourclinic.com",
    siteName: "Premium Medical Clinic",
    images: [
      {
        url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1000",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": "Premium Medical Clinic",
  "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1000",
  "url": "https://yourclinic.com",
  "telephone": process.env.NEXT_PUBLIC_CLINIC_PHONE || "+919876543210",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Health Avenue",
    "addressLocality": "Indore",
    "addressRegion": "Madhya Pradesh",
    "postalCode": "452001",
    "addressCountry": "IN"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "14:00"
    }
  ],
  "medicalSpecialty": "InternalMedicine"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-smooth ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-secondary font-sans selection:bg-primary-100 selection:text-primary-900 flex flex-col items-center overflow-x-hidden min-h-screen">
        <Navbar />
        <main className="w-full flex-1 flex flex-col items-center">
          {children}
        </main>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  );
}