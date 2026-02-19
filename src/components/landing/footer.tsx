'use client';

import Image from "next/image";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";
import { CiLocationArrow1 } from "react-icons/ci";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-blue-900 py-10 px-4 md:px-32 ">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left"
      >
        {/* Left: Logo and copyright */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-start text-left w-full"
        >
          <div className="flex items-center gap-2 mb-1">
            <Image
              src="/favicon.ico"
              alt="PayMee Favicon"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="font-bold text-2xl">PayMee</span>
          </div>
          <p className="mt-2 text-blue-900 text-sm">
            &copy; {new Date().getFullYear()} PayMee. All rights reserved.
          </p>
        </motion.div>
        {/* Right: Email and location */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-start md:items-end gap-2 text-sm min-w-[260px] text-left w-full"
        >
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-blue-800" />
            <span className="font-semibold">Email:</span>
            <a
              href="mailto:support@paymee.com"
              className="hover:underline text-blue-900"
            >
              support@paymee.com
            </a>
          </div>
          <div className="flex items-center gap-1 self-start md:self-end -ml-2 md:ml-10">
            <span className="w-[24px] flex justify-center">
              <FaMapMarkerAlt className="text-blue-800" />
            </span>
            <span className="font-semibold">Location:</span>
            <span className="text-blue-900">Madison, Lagos, Nigeria</span>
          </div>
        </motion.div>
      </motion.div>
      {/* Long horizontal line */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.7 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="w-full flex justify-center mt-10"
      >
        <hr className="w-full max-w-6xl border-t border-gray-300" />
      </motion.div>
      {/* Newsletter + Quick Links + App Download */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        viewport={{ once: true }}
        className="w-full flex flex-col md:flex-row items-start md:items-start justify-between mt-16 max-w-6xl mx-auto gap-8 text-left"
      >
        {/* Newsletter subscription */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-start w-full max-w-xs"
        >
          <label
            htmlFor="newsletter"
            className="font-semibold text-blue-900 text-xl mb-4"
          >
            Subscribe to our newsletter:
          </label>
          <div className="flex items-center w-full">
            <div className="relative flex-1">
              <input
                id="newsletter"
                type="email"
                required
                placeholder="E-mail"
                className="md:w-full w-[350px]  bg-transparent border-b border-blue-900 outline-none py-2 px-1 text-blue-900 placeholder-blue-900 text-base pr-10"
                style={{ paddingRight: "2.5rem" }}
              />
              <CiLocationArrow1 className="text-blue-800 text-2xl cursor-pointer absolute right-0 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          {/* Social icons under the email line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            className="flex gap-4 mt-6"
          >
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="bg-blue-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition"
            >
              <FaInstagram className="text-white text-xl" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="bg-blue-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition"
            >
              <FaFacebookF className="text-white text-xl" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="bg-blue-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition"
            >
              <FaLinkedinIn className="text-white text-xl" />
            </a>
          </motion.div>
        </motion.div>
        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-start gap-2 text-blue-900 text-sm"
        >
          <span className="font-semibold text-blue-900 text-base mb-2">
            Quick Links
          </span>
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
          <a href="/about" className="hover:underline">
            About
          </a>
        </motion.div>
        {/* App Download (Coming Soon) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="hidden md:flex flex-col items-end gap-2"
        >
          <span className="font-semibold text-blue-900 text-base mb-2">
            Get the App
          </span>
          <div className="flex flex-col gap-2">
            <span className="bg-blue-200 text-blue-900 px-4 py-2 rounded-lg font-semibold opacity-60 cursor-not-allowed flex items-center gap-2">
              <FaApple className="text-xl" />
              App Store <span className="text-xs ml-2">(Coming Soon)</span>
            </span>
            <span className="bg-blue-200 text-blue-900 px-4 py-2 rounded-lg font-semibold opacity-60 cursor-not-allowed flex items-center gap-2">
              <FaGooglePlay className="text-xl" />
              Google Play <span className="text-xs ml-2">(Coming Soon)</span>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}