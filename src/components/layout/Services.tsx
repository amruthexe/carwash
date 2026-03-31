import { Car, Droplets, Sparkles, ShieldCheck, Clock, MapPin } from "lucide-react";

const services = [
  {
    title: "Exterior Wash",
    desc: "High-pressure foam wash for a spotless shine",
    icon: Droplets,
  },
  {
    title: "Interior Cleaning",
    desc: "Deep vacuum and dashboard detailing",
    icon: Car,
  },
  {
    title: "Ceramic Coating",
    desc: "Long-lasting hydrophobic protection",
    icon: ShieldCheck,
  },
  {
    title: "Premium Detailing",
    desc: "Showroom-level finish and polish",
    icon: Sparkles,
  },
  {
    title: "Quick Wash",
    desc: "Fast and efficient cleaning in minutes",
    icon: Clock,
  },
  {
    title: "Doorstep Service",
    desc: "We come to your location for convenience",
    icon: MapPin,
  },
];

export default function HomeServices() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">

        {/* HEADER */}
        <p className="text-sm text-[var(--primary)] font-semibold mb-3">
          OUR SERVICES
        </p>

        <h2 className="text-3xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight">
          Premium Car Care Solutions
        </h2>

        <p className="mt-4 text-[var(--muted-foreground)] max-w-2xl mx-auto">
          We provide top-tier car washing and detailing services designed to keep your vehicle looking brand new.
        </p>

        {/* GRID */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 text-left shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-[var(--border)]"
              >
                {/* ICON */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4 group-hover:scale-110 transition">
                  <Icon size={24} />
                </div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {service.title}
                </h3>

                {/* DESC */}
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {service.desc}
                </p>

                {/* HOVER LINE */}
                <div className="mt-4 h-[2px] w-0 bg-[var(--primary)] group-hover:w-full transition-all duration-300"></div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}