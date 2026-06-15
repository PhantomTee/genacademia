import { AsciiHero } from "@/components/AsciiHero";
import { StartLearningButton } from "@/components/StartLearningButton";

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-20 border-b border-ink/10 dark:border-cream-200/10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest border border-ink/30 dark:border-cream-200/30 text-ink/60 dark:text-cream-200/60">
              Now in Beta
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            <div className="flex-1">
              <h1 className="text-[clamp(2rem,6vw,5.5rem)] font-black uppercase leading-[0.88] tracking-tight text-ink dark:text-cream-200 mb-10">
                Smart contracts
                <br />
                that think
                <br />
                for themselves.
              </h1>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 sm:gap-0 mt-8">
                <StartLearningButton className="text-center px-8 py-4 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity disabled:opacity-50" />
                <a
                  href="https://docs.genlayer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center px-8 py-4 text-sm font-bold uppercase tracking-widest border border-ink/30 dark:border-cream-200/30 hover:border-ink dark:hover:border-cream-200 text-ink dark:text-cream-200 transition-colors sm:-ml-px"
                >
                  View Docs →
                </a>
              </div>
            </div>

            <div className="flex-shrink-0 hidden lg:flex items-start justify-center pt-2">
              <AsciiHero />
            </div>
          </div>
        </div>
      </section>

      {/* Sub-hero description */}
      <section className="px-4 sm:px-6 py-10 sm:py-14 border-b border-ink/10 dark:border-cream-200/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <p className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed text-ink/80 dark:text-cream-200/80 max-w-lg">
            30 lessons. 5 project paths. Go from zero to building AI-powered
            intelligent contracts on GenLayer — directly in your browser.
          </p>
          <div className="grid grid-cols-3 gap-0">
            {[
              { num: "30", label: "Lessons" },
              { num: "5",  label: "Project Paths" },
              { num: "0",  label: "Local Setup" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-4 sm:p-6 border border-ink/10 dark:border-cream-200/10 ${i > 0 ? "-ml-px" : ""}`}
              >
                <div className="text-3xl sm:text-5xl font-black text-ink dark:text-cream-200 leading-none mb-1">
                  {s.num}
                </div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-cream-200/50">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="how-it-works" className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-8 sm:mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                step: "01",
                title: "Pick a path.",
                desc: "Choose from 5 real-world project contexts: prediction markets, DAOs, freelance escrow, developer reputation, or insurance.",
              },
              {
                step: "02",
                title: "Write & deploy.",
                desc: "Code Python intelligent contracts in the browser. Deploy live to Studionet with one click — MetaMask signs, validators confirm.",
              },
              {
                step: "03",
                title: "Verify on-chain.",
                desc: "Each lesson verifies your deployed contract against a real specification. Pass = complete. No fake tests.",
              },
            ].map((f, i) => (
              <div
                key={f.step}
                className={`p-6 sm:p-8 border border-ink/10 dark:border-cream-200/10 -mt-px first:mt-0 md:mt-0 ${i > 0 ? "md:-ml-px" : ""} group hover:bg-ink dark:hover:bg-cream-200 transition-colors`}
              >
                <div className="text-xs font-bold text-ink/30 dark:text-cream-200/30 group-hover:text-cream-200/40 dark:group-hover:text-ink/40 mb-4 uppercase tracking-widest">
                  {f.step}
                </div>
                <h3 className="text-xl font-black uppercase text-ink dark:text-cream-200 group-hover:text-cream-200 dark:group-hover:text-ink mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-ink/60 dark:text-cream-200/60 group-hover:text-cream-200/70 dark:group-hover:text-ink/70 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 border-t border-ink/10 dark:border-cream-200/10 bg-ink dark:bg-cream-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <h2 className="text-[clamp(2rem,6vw,5rem)] font-black uppercase leading-none text-cream-200 dark:text-ink">
            Ready to
            <br />
            build?
          </h2>
          <StartLearningButton className="w-full sm:w-auto text-center px-8 py-4 text-sm font-bold uppercase tracking-widest border border-cream-200 dark:border-ink bg-cream-200 dark:bg-ink text-ink dark:text-cream-200 hover:opacity-80 transition-opacity flex-shrink-0 disabled:opacity-50" />
        </div>
      </section>
    </>
  );
}
