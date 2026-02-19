"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Services() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-4 md:px-32 py-20 bg-gray-100">
      <h2 className="text-3xl md:text-4xl text-blue-900 text-center mb-12">
        CAN YOU HELP US ACHIEVE <br /> FINANCIAL SUCCESS
      </h2>
      <div className="w-full flex flex-col items-center gap-12">
        {/* Dashboard Service - Full Width & Enhanced Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="relative flex flex-col md:flex-row items-center bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50 rounded-3xl shadow-2xl p-10 w-full max-w-6xl overflow-hidden border border-blue-200"
        >
          {/* Decorative background shapes */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full z-0" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-blue-400 opacity-10 rounded-full z-0" />
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            className="z-10 flex-shrink-0 flex items-center justify-center rounded-3xl md:mr-12 mb-4 md:-mb-10"
          >
            <Image
              src="/home.png"
              alt="Dashboard Service"
              width={180}
              height={180}
              className="object-contain md:w-[240px] md:h-[240px] w-[180px] h-[180px] rounded-3xl"
            />
          </motion.div>
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            className="z-10 flex flex-col items-center md:items-start w-full"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">All-in-One Dashboard</h3>
            <p className="text-gray-700 text-center md:text-left text-lg mb-4">
              Take control of your financial journey with PayMee’s powerful dashboard. Monitor balances, track spending, set goals, and visualize your entire financial life in one place securely and effortlessly.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="bg-blue-800 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">Balance Overview</span>
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">Goal Setting</span>
              <span className="bg-blue-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">Spending Insights</span>
            </div>
          </motion.div>
        </motion.div>
        {/* Card & Exchange - 2 Enhanced Cards */}
      </div>
    </section>
  );
}