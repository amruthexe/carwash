"use client";

import Link from "next/link";

const cards = [
  {
    title: "Book Your Wash",
    desc: "Schedule your car wash in seconds. No waiting, no hassle.",
    btn: "Start Booking →",
    gradient: "from-blue-600 via-indigo-500 to-purple-600",
  },
  {
    title: "Transparent Pricing",
    desc: "Know exactly what you pay with no hidden charges.",
    btn: "View Plans",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
  },
  {
    title: "Premium Care",
    desc: "Get showroom-level finish with advanced detailing.",
    btn: "Schedule Service",
    gradient: "from-green-500 via-lime-500 to-emerald-600",
  },
];

export default function NextSteps() {
  return (
    <section className="py-20 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
        
        <h2 className="text-3xl lg:text-4xl font-bold mb-12 tracking-tight">
          Next Steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-[1px] bg-gradient-to-br ${card.gradient} group transition-transform duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl`}
            >
              {/* INNER CARD */}
              <div className="relative h-full rounded-[23px] bg-white p-8 overflow-hidden">
                
                {/* GLOW EFFECT (Placed behind content using z-0) */}
                <div className={`absolute -inset-24 opacity-0 group-hover:opacity-10 transition duration-500 bg-gradient-to-br ${card.gradient} blur-3xl z-0`}></div>

                {/* CONTENT */}
                <div className="relative z-10 text-left flex flex-col h-full">
                  <h3 className="text-xl font-bold mb-3 text-slate-800">
                    {card.title}
                  </h3>

                  <p className="text-slate-600 mb-8 leading-relaxed">
                    {card.desc}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href="#"
                      className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-md"
                    >
                      {card.btn}
                    </Link>
                  </div>
                </div>

                {/* TOP RIGHT ICON */}
                <div className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-slate-900 transition-colors z-10">
                  <span className="transform group-hover:rotate-45 transition-transform duration-300">↗</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}