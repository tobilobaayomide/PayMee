"use client";

import { useState, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Is PayMee secure?",
    answer:
      "Absolutely! PayMee uses bank-level encryption, fraud detection, and biometric authentication to keep your data and money safe.",
  },
  {
    question: "Can I export my transaction history?",
    answer:
      "Yes, you can easily export your transaction history in multiple formats for accounting or personal use.",
  },
  {
    question: "How do I connect my bank or card?",
    answer:
      "Simply follow the prompts in the dashboard to securely link your bank accounts or cards. All connections are encrypted.",
  },
  {
    question: "Does PayMee support currency exchange?",
    answer:
      "Yes! You can exchange currencies instantly with competitive rates and low fees, right from your dashboard.",
  },
  {
    question: "Is my personal information shared?",
    answer:
      "No. Your privacy is our priority. Your information is never sold or shared with third parties.",
  },
  {
    question: "How do I contact PayMee support?",
    answer:
      "You can reach our support team anytime via email at support@paymee.com or through the contact form on our website.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section
      className="w-full flex flex-col items-center justify-center px-4 md:px-32 py-20 bg-gray-100 md:scroll-mt-28 scroll-mt-10"
      id="faq"
    >
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl  text-blue-900 text-center mb-10 tracking-tight"
      >
        Frequently Asked Questions
      </motion.h2>
      <div className="w-full max-w-5xl flex flex-col md:flex-row md:flex-wrap items-start gap-6">
        {faqs.map((faq, idx) => {
          const isOpen = open === idx;
          const maxHeight =
            isOpen && answerRefs.current[idx]
              ? answerRefs.current[idx]!.scrollHeight + "px"
              : "0px";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 * idx, ease: [0.4, 0, 0.2, 1] }}
              viewport={{ once: true }}
              className={`transition-all duration-300 border border-blue-100 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm ${
                isOpen ? "ring-2 ring-blue-400" : ""
              } w-full md:w-[calc(50%-0.75rem)]`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none group"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
              >
                <span className="font-semibold text-blue-900 text-[14px] md:text-lg group-hover:text-blue-700 transition">
                  {faq.question}
                </span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-200 transition">
                  <FaChevronDown
                    className={`transition-transform duration-300 text-blue-700 ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
              <div
                id={`faq-answer-${idx}`}
                ref={(el) => {
                  answerRefs.current[idx] = el;
                }}
                className={`overflow-hidden transition-all duration-300 px-6 ${
                  isOpen ? "mb-6" : ""
                }`}
                style={{
                  maxHeight,
                  paddingBottom: isOpen ? "1.5rem" : "0",
                  opacity: isOpen ? 1 : 0,
                }}
                aria-hidden={!isOpen}
              >
                <div className="text-blue-800 text-sm md:text-base">{faq.answer}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}