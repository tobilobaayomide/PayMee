"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-6 md:px-40 pt-20 bg-blue-100 mt-20 pb-0" id="top">
      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="flex flex-col items-center gap-6 text-center mt-8"
      >
        <h1 className="text-5xl md:text-6xl text-blue-900 leading-tight">
          Seamless Payments, <br /> <span className="text-blue-600">Simplified</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-xl">
          Experience fast, secure, and intuitive payments for everyone. Join PayMee and simplify your financial life today!
        </p>
        <a
          href="/signup"
          className="mt-4 bg-blue-800 text-white px-10 py-3 rounded-3xl text-lg font-semibold hover:bg-blue-600 transition"
        >
          Get Started
        </a>
      </motion.div>
      {/* Hero Image Under Texts with Curved Top Edges */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="flex justify-center mt-16 w-full mb-[-1px] pb-0"
      >
        <Image
          src="/hero2.png"
          alt="PayMee Hero Illustration"
          width={1300}
          height={750}
          className="w-full max-w-[1300px] rounded-t-3xl align-bottom"
          style={{ display: "block", marginBottom: 0 }}
        />
      </motion.div>
    </section>
  );
}