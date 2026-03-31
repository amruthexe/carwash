
"use client";
import Image from "next/image";
import Link from "next/link";
import { Droplets, CalendarCheck, ShieldCheck, MapPin, Menu, X } from "lucide-react";
import Homes from "@/components/layout/Home";
import { useState } from "react";
import HomeServices from "@/components/layout/Services";
import Process from "@/components/layout/Process";
import NextSteps from "@/components/layout/NextSteps";
import Footer from "@/components/layout/Footer";

export default function Home() {

  const [open, setOpen] = useState(false);


  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PureWash Logo"
            width={42}
            height={42}
            className="object-contain"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
            Pure<span className="text-[var(--primary)]">Wash</span>
          </h1>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 ml-10">
          <Link href="/about" className="nav-link">How it works</Link>
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </nav>

        {/* DESKTOP BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-secondary">
            Login
          </Link>
          <Link href="/login" className="btn-primary">
            Get Started
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[var(--secondary)] transition"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 flex flex-col gap-4 bg-white/95 backdrop-blur-md border-t border-[var(--border)]">

          <Link href="/about" className="mobile-link" onClick={() => setOpen(false)}>
            How it works
          </Link>

          <Link href="/pricing" className="mobile-link" onClick={() => setOpen(false)}>
            Pricing
          </Link>

          <Link href="/contact" className="mobile-link" onClick={() => setOpen(false)}>
            Contact
          </Link>

          <div className="flex flex-col gap-3 mt-4">
            <Link href="/login" className="btn-secondary text-center">
              Login
            </Link>

            <Link href="/login" className="btn-primary text-center">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>

      {/* Main Hero Section */}
      
      <Homes/>
      <HomeServices/>
      <Process/>
      <NextSteps/>
      <Footer/>

     

    </div>
  );
}
