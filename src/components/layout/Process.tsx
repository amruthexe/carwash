import { ScanLine, Waves, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Scan & Assess",
    desc: "We inspect your vehicle thoroughly to identify dirt, scratches, and surface issues before cleaning.",
    icon: ScanLine,
  },
  {
    number: "02",
    title: "Deep Wash",
    desc: "Using high-pressure foam and purified water, we remove contaminants safely without damage.",
    icon: Waves,
  },
  {
    number: "03",
    title: "Protect & Shine",
    desc: "We apply protective coating to give your car a long-lasting shine and hydrophobic finish.",
    icon: ShieldCheck,
  },
];

export default function Process() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">

        {/* HEADER */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm text-[var(--primary)] font-semibold mb-3 tracking-wider">
              THE PROCESS
            </p>

            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight">
              Engineered for Perfection.
            </h2>
          </div>

          <p className="text-[var(--muted-foreground)] max-w-md">
            Our premium workflow ensures every vehicle gets the highest level of care using advanced techniques and detailing precision.
          </p>
        </div>

        {/* STEPS */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-[var(--border)] overflow-hidden"
              >
                
                {/* BIG BACK NUMBER */}
                <span className="absolute top-4 right-6 text-6xl font-extrabold text-gray-100 select-none">
                  {step.number}
                </span>

                {/* ICON */}
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-6">
                  <Icon size={26} />
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  {step.number}. {step.title}
                </h3>

                {/* DESC */}
                <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed text-sm">
                  {step.desc}
                </p>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}