'use client';

import { motion } from 'framer-motion';
import Hero from '@/components/sections/Hero';
import WhyUs from '@/components/sections/WhyUs';
import TemplatesGallery from '@/components/sections/TemplatesGallery';
import TrustedBy from '@/components/sections/TrustedBy';
import Pricing from '@/components/sections/Pricing';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import PricingClient from "@/app/pricing/pricingClient";

export default function HomePage() {
  return (
    <motion.div
      className="bg-slate-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main>
        <Hero />
        <WhyUs />
        <TemplatesGallery />
        <TrustedBy />
        <PricingClient />
        <Testimonials />
        <Contact />
      </main>
    </motion.div>
  );
}
