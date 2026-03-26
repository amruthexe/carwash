import Image from "next/image";
import Link from "next/link";
import { Droplets, CalendarCheck, ShieldCheck, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 bg-white shadow-sm flex items-center justify-between border-b-4 border-[var(--primary)] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Water Drop Logo" width={50} height={50} className="object-contain" />
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">Pure<span className="text-[var(--primary)]">Wash</span></h1>
        </div>
        <nav className="hidden md:flex gap-6 items-center flex-1 justify-end ml-8">
          <Link href="/about" className="text-xl font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">How it works</Link>
          <Link href="/pricing" className="text-xl font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Pricing</Link>
        </nav>
        <div className="ml-8 flex gap-4">
          <Link href="/login" className="px-6 py-3 rounded-full text-xl font-bold text-[var(--foreground)] bg-[var(--secondary)] hover:bg-[var(--border)] transition-colors">
            Login
          </Link>
          <Link href="/login" className="hidden sm:inline-block px-8 py-3 rounded-full text-xl font-bold text-white bg-[var(--primary)] hover:bg-[var(--secondary-foreground)] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center">
        {/* Banner with AI Image */}
        <section className="w-full relative min-h-[500px] flex items-center justify-center bg-[var(--foreground)]">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/hero.png" 
              alt="Clean shiny car in a peaceful community" 
              fill
              priority
              className="object-cover opacity-60 mix-blend-overlay"
            />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-md">
              A Sparkling Clean Car, <br/> Without Leaving Home.
            </h2>
            <p className="text-2xl md:text-3xl font-normal mb-10 max-w-2xl drop-shadow">
              The easiest way to schedule professional car cleaning inside your gated community.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                href="/login" 
                className="px-12 py-5 rounded-full text-2xl font-bold bg-white text-[var(--foreground)] hover:bg-[var(--secondary)] shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                <CalendarCheck className="w-8 h-8 text-[var(--primary)]" />
                Book a Wash Now
              </Link>
            </div>
          </div>
        </section>

        {/* Features - High Contrast Cards */}
        <section className="w-full max-w-6xl mx-auto py-20 px-6">
          <h3 className="text-4xl font-bold text-center text-[var(--foreground)] mb-12">Why Choose PureWash?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-[var(--border)] text-center flex flex-col items-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <h4 className="text-3xl font-bold text-[var(--foreground)] mb-4">We Come To You</h4>
              <p className="text-xl text-[var(--muted-foreground)]">Our vetted cleaners come directly to your parking spot in your community.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg border border-[var(--border)] text-center flex flex-col items-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-6">
                <Droplets className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <h4 className="text-3xl font-bold text-[var(--foreground)] mb-4">Premium Wash</h4>
              <p className="text-xl text-[var(--muted-foreground)]">Using high-quality, eco-friendly water-saving techniques.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg border border-[var(--border)] text-center flex flex-col items-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <h4 className="text-3xl font-bold text-[var(--foreground)] mb-4">Trusted & Safe</h4>
              <p className="text-xl text-[var(--muted-foreground)]">Only verified workers get access. Safe for your car, safe for you.</p>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[var(--foreground)] text-white py-12 px-6 flex flex-col items-center border-t-8 border-[var(--primary)]">
        <div className="max-w-6xl w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-90">
             <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain grayscale brightness-200" />
             <span className="text-2xl font-bold tracking-tight">PureWash</span>
          </div>
          <p className="text-lg opacity-80 text-center md:text-left">© {new Date().getFullYear()} PureWash Gated Community System. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xl hover:text-[var(--accent)] underline-offset-4 hover:underline">Help</Link>
            <Link href="#" className="text-xl hover:text-[var(--accent)] underline-offset-4 hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
