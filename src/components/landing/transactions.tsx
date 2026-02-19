"use client";

import Image from "next/image";
import { FaHistory, FaDownload, FaSearchDollar, FaFileExport } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Transactions() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-6 md:px-40 py-20 bg-gray-100 md:scroll-mt-10 scroll-mt-8" id="services">
      <div className="w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="w-full max-w-6xl bg-blue-100 rounded-3xl shadow-lg p-8 md:p-16 flex flex-col md:flex-row items-center justify-between"
        >
          {/* Left: Screenshot */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            className="flex-1 flex justify-center mb-10 md:mb-0 md:mr-12"
          >
            <Image
              src="/transactionsimg.png"
              alt="PayMee Transactions Screenshot"
              width={600}
              height={420}
              className="rounded-2xl w-full max-w-xl"
            />
          </motion.div>
          {/* Right: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            className="flex-1 flex flex-col items-start gap-6"
          >
            <h2 className="text-3xl md:text-4xl text-blue-900 ">
              Effortless Transaction Management
            </h2>
            <p className="text-gray-700 max-w-xl text-lg">
              Stay on top of your finances with PayMee’s comprehensive transactions page. Instantly view your full payment history, search and filter transactions, and export your records for accounting or personal use.
            </p>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                  <FaHistory size={18} />
                </span>
                <span className="text-blue-800 font-medium text-base">Full transaction history at your fingertips</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                  <FaSearchDollar size={18} />
                </span>
                <span className="text-blue-800 font-medium text-base">Search, filter, and analyze your payments</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                  <FaDownload size={18} />
                </span>
                <span className="text-blue-800 font-medium text-base">Export or download your transaction data</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                  <FaFileExport size={18} />
                </span>
                <span className="text-blue-800 font-medium text-base">Seamless integration with your accounting tools</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}