'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { IoCloseOutline } from "react-icons/io5";


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="w-full flex items-center justify-between px-6 md:px-60 py-6 md:py-6 bg-blue-100 fixed top-0 left-0 z-50">
      {/* Logo and PayMee */}
           <div className="flex items-center">
        <Link href="/" scroll={true} className="flex items-center">
          <Image
            src="/favicon.ico"
            alt="PayMee Logo"
            width={36}
            height={36}
            className="mr-2"
          />
          <span className="text-2xl font-bold text-blue-800">PayMee</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex gap-8 text-[16px] font-bold">
        <Link href="#features" className="text-blue-800 hover:text-blue-500 transition">Features</Link>
        <Link href="#services" className="text-blue-800 hover:text-blue-500 transition">Services</Link>
        <Link href="#testimonials" className="text-blue-800 hover:text-blue-500 transition">Testimonials</Link>
        <Link href="#faq" className="text-blue-800 hover:text-blue-500 transition">FAQ</Link>
      </div>

      {/* Desktop Auth Button */}
      <div className="hidden md:flex gap-4">
        <Link href="/signup" className="bg-blue-800 text-white text-[16px] px-7 py-3 rounded-3xl hover:bg-blue-700 transition">Sign Up</Link>
      </div>

      {/* Hamburger Menu for Mobile */}
      <button
        className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? (
          // Close (X) icon
          <IoCloseOutline size={25} color="#1e3a8a" />
        ) : (
          // Hamburger icon
          <RxHamburgerMenu size={25} color="#1e3a8a" />
        )}
      </button>

      {/* Mobile Menu - Full Width with Animation */}
      <div
        className={`absolute top-20 left-0 w-full bg-gray-100 rounded-none shadow-lg p-6 flex flex-col gap-4 md:hidden z-50 transition-all duration-300 ${
          menuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-8'
        }`}
      >
        <Link href="#features" className="text-blue-800 hover:text-blue-500 transition" onClick={() => setMenuOpen(false)}>Features</Link>
        <Link href="#services" className="text-blue-800 hover:text-blue-500 transition" onClick={() => setMenuOpen(false)}>Services</Link>
        <Link href="#testimonials" className="text-blue-800 hover:text-blue-500 transition" onClick={() => setMenuOpen(false)}>Testimonials</Link>
        <Link href="#faq" className="text-blue-800 hover:text-blue-500 transition" onClick={() => setMenuOpen(false)}>FAQ</Link>
        <Link
          href="/signup"
          className="bg-blue-800 text-white text-[16px] px-4 py-2 rounded-3xl hover:bg-blue-700 transition w-fit self-start -ml-4"
          onClick={() => setMenuOpen(false)}
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}