"use client";

import Image from "next/image";
import { FaQuoteLeft, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Dwayne Carter",
    title: "Small Business Owner",
    image: "/user1.png",
    quote:
      "PayMee has completely transformed the way I manage my business finances. The dashboard is intuitive and the card management is seamless!",
  },
  {
    name: "David Lee",
    title: "Freelancer",
    image: "/user2.png",
    quote:
      "Exporting my transaction history for taxes is now effortless. I love how secure and easy PayMee makes everything.",
  },
  {
    name: "Paul Hawkins",
    title: "Entrepreneur",
    image: "/user3.png",
    quote:
      "The currency exchange feature is a game changer for my international clients. Fast, reliable, and with great rates!",
  },
];

export default function Testimonial() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center px-0 py-20 bg-gray-100 md:scroll-mt-22 scroll-mt-0" id="testimonials">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="relative w-full flex flex-col items-center justify-center px-4 md:px-32 py-20 bg-blue-100 overflow-hidden rounded-[3rem] md:rounded-[3rem] md:scroll-mt-32 scroll-mt-10"
        id="testimonials"
      >
        {/* Decorative blurred shapes */}
        <h2 className="text-3xl md:text-4xl text-blue-900 text-center mb-12 tracking-tight drop-shadow-lg">
          What Our Users Say
        </h2>
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 justify-center items-stretch z-10">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 * i, ease: [0.4, 0, 0.2, 1] }}
              viewport={{ once: true }}
              className="relative flex flex-col items-center bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-8 flex-1 transition-transform hover:-translate-y-2 hover:shadow-2xl group"
            >
              {/* Overlapping avatar */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg bg-white z-20">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Quote icon */}
              <span className="absolute top-4 left-6 text-blue-200 text-5xl opacity-60 pointer-events-none z-10">
                <FaQuoteLeft />
              </span>
              <div className="mt-12" /> {/* Spacer for avatar */}
              <p className="text-blue-900 text-center italic mb-4 font-medium leading-relaxed">
                "{t.quote}"
              </p>
              <div className="text-center flex flex-col items-center gap-1">
                <span className="flex items-center gap-1 font-bold text-blue-900">
                  {t.name}
                  <FaCheckCircle className="text-green-500 text-base" title="Verified user" />
                </span>
                <span className="block text-blue-600 text-sm">{t.title}</span>
              </div>
              {/* Accent bar */}
              <div className="mt-6 w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 opacity-60" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}