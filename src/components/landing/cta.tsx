"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-2 sm:px-4 md:px-32 py-14 bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="relative w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between px-3 sm:px-6 md:px-24 py-6 md:py-0 overflow-hidden"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, #1e3a8a 0deg, #1e40af 90deg, #2563eb 180deg, #1e40af 270deg, #1e3a8a 360deg)"
        }}
      >
        {/* Decorative blurred circles */}
        <div className="absolute -top-16 -left-16 w-52 h-52 sm:w-72 sm:h-72 bg-blue-800 opacity-30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-blue-600 opacity-20 rounded-full blur-3xl pointer-events-none" />

        {/* CTA Image on the right (mobile: above content, desktop: right) */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex-1 flex justify-center md:justify-end w-full z-10 order-1 md:order-2 mt-8 md:mt-5 md:mb-0 mb-4"
        >
          <Image
            src="/cta.png"
            alt="CTA Visual"
            width={220}
            height={220}
            className="object-contain max-h-48 sm:max-h-60 md:max-h-80 w-auto"
            priority
          />
        </motion.div>
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex-1 flex flex-col items-center md:items-start z-10 py-6 md:py-16 order-2 md:order-1"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center md:text-left mb-4 sm:mb-6 leading-tight drop-shadow-lg">
            Ready to Take Control <br className="hidden md:block" /> of Your Finances?
          </h2>
          <motion.a
            href="/signup"
            whileHover={{ scale: 1.07, boxShadow: "0 0 0 8px #3b82f633" }}
            whileTap={{ scale: 0.97 }}
            className="relative bg-white/90 text-blue-900 font-bold px-8 py-3 rounded-full text-base sm:text-lg shadow-lg hover:bg-blue-100 transition border-2 border-blue-100 hover:scale-105 active:scale-95 duration-150 mt-4 focus:outline-none"
          >
            Get Started
            {/* Animated pulse ring */}
            <span className="absolute -inset-2 rounded-full border-2 border-blue-400 opacity-30 animate-ping pointer-events-none"></span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}