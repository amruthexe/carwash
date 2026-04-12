import Image from "next/image";
import Link from "next/link";
import { Droplets, Sparkles } from "lucide-react";

export default function Homes() {
  return (
    <section className="relative bg-[var(--background)] overflow-hidden">
      
      {/* BACKGROUND BLUR SHAPES */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-40 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100 rounded-full blur-3xl opacity-40 -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT CONTENT */}
        <div>
          <p className="text-sm tracking-widest text-[var(--primary)] font-semibold mb-4">
            PREMIUM AUTOMOTIVE CARE
          </p>

          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-[var(--foreground)]">
            The Art of{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Weightless
            </span>{" "}
            Precision.
          </h1>

          <p className="mt-6 text-[var(--muted-foreground)] max-w-lg text-lg leading-relaxed">
            Experience a pressurized, clean environment where every detail is handled with surgical accuracy. We don’t just wash — we preserve.
          </p>

          {/* CTA BUTTONS */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="px-7 py-3 bg-[var(--primary)] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Book a Detail
            </Link>

            <Link
              href="/services"
              className="px-7 py-3 border border-[var(--border)] rounded-full font-semibold hover:bg-[var(--secondary)] transition-all"
            >
              Explore Services
            </Link>
          </div>

          {/* FEATURE BADGES */}
          <div className="mt-10 flex gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Droplets className="text-blue-500" size={18} />
              Hydrophobic Coating
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Sparkles className="text-indigo-500" size={18} />
              Showroom Finish
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative">
          
          {/* IMAGE CARD */}
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/car.png"
              alt="Car detailing"
              width={900}
              height={600}
              className="object-cover w-full h-full"
              loading="eager"
            />
          </div>

          {/* FLOAT CARD TOP */}
          <div className="absolute -top-6 right-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg px-4 py-3 w-44">
            <p className="text-sm font-semibold text-gray-900">💧 Hydrophobic</p>
            <p className="text-xs text-gray-500">Nanoceramic Tech</p>
          </div>

          {/* FLOAT CARD BOTTOM */}
          <div className="absolute -bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg px-4 py-3 w-52">
            <p className="text-sm font-semibold text-gray-900">✨ Showroom Finish</p>
            <p className="text-xs text-gray-500">0.05% Surface Roughness</p>
          </div>

        </div>
      </div>
    </section>
  );
}