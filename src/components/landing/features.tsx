"use client";

import Image from "next/image";
import { FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Clarity() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-6 md:px-40 py-20 bg-gray-100 scroll-mt-10" id="features">
      {/* Top: Text and Image Side by Side */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex-[0.8] flex flex-col items-start gap-6 md:mr-8"
        >
          <h2 className="text-3xl md:text-4xl text-blue-900">
            Everything You Need to Grow Smarter
          </h2>
          <p className="text-gray-700 max-w-xl text-lg">
            Real-time analytics and intelligent insights that help you understand
            your business and make confident decisions. With PayMee, you can track
            your financial health, identify growth opportunities, and optimize
            your operations for maximum profitability.
          </p>
          <button className="bg-transparent px-0 py-0">
            <span className="text-blue-800 underline font-semibold text-base hover:text-blue-600 transition">
              View More
            </span>
          </button>
        </motion.div>
        {/* Right: Screenshot */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex-[1.2] flex justify-center mt-10 md:mt-20 md:ml-8"
        >
          <Image
            src="/features.png"
            alt="PayMee Dashboard Screenshot"
            width={1000}
            height={700}
            className="rounded-2xl shadow-lg w-full max-w-5xl"
          />
        </motion.div>
      </div>
      {/* Bottom: Features Row */}
      <motion.ul
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="mt-16 flex flex-wrap justify-between gap-x-20 gap-y-4 w-full max-w-6xl"
      >
        <li className="flex items-center gap-4 flex-1 min-w-[220px]">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 text-white">
            <FaCheck size={18} />
          </span>
          <span className="text-blue-800 font-semibold text-xl">Smart Wallet</span>
        </li>
        <li className="flex items-center gap-4 flex-1 min-w-[220px]">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 text-white">
            <FaCheck size={18} />
          </span>
          <span className="text-blue-800 font-semibold text-xl">Profit Planner</span>
        </li>
        <li className="flex items-center gap-4 flex-1 min-w-[220px]">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 text-white">
            <FaCheck size={18} />
          </span>
          <span className="text-blue-800 font-semibold text-xl">Finance Flow</span>
        </li>
        <li className="flex items-center gap-4 flex-1 min-w-[220px]">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 text-white">
            <FaCheck size={18} />
          </span>
          <span className="text-blue-800 font-semibold text-xl">Expense Explorer</span>
        </li>
      </motion.ul>
    </section>
  );
}