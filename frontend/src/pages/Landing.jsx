import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ShieldCheck,
  ArrowLeftRight,
  FileText,
  Pencil,
  TrendingUp,
  Check,
  Building2,
  Users,
  Sparkles,
  Bot,
  Download,
  Mail,
  ChevronDown,
} from "lucide-react";

// ---------- Animated Background Elements ----------
const FloatingOrb = ({ className, size = 200, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    style={{ width: size, height: size }}
    animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
    transition={{ repeat: Infinity, duration: 6, delay, ease: "easeInOut" }}
  />
);

const NetworkLines = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
    }));
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
      ctx.lineWidth = 1;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          if (dx * dx + dy * dy < 15000) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

// ---------- Scroll Reveal Component ----------
const FadeInView = ({ children, direction = "up", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 40 : -40 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// ---------- Counter Component ----------
const Counter = ({ end, label, suffix = "+" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <div ref={ref} className="text-center">
      <span className="text-4xl md:text-5xl font-bold text-[#D4AF37]">
        {count}{suffix}
      </span>
      <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">{label}</p>
    </div>
  );
};

// ---------- FAQ Item ----------
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left text-lg font-medium text-[#0A1929] dark:text-white focus:outline-none"
      >
        {question}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-2xl text-[#D4AF37]"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-slate-600 dark:text-slate-400">{answer}</p>
      </motion.div>
    </div>
  );
};

// ---------- Main Landing Component ----------
const Landing = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSent(true);
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setContactSent(false), 5000);
  };

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] dark:bg-[#0A1929] dark:text-slate-100 font-sans">
      {/* ---------- NAVBAR ---------- */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0A1929]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/pfurex-analytics-log.png" alt="Pfurex Analytics" className="h-10 w-auto" />
            <span className="text-xl font-bold text-[#0A1929] dark:text-white">Pfurex Analytics</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-sm tracking-wide">
            <a href="#how-it-works" className="hover:text-[#D4AF37] transition">How It Works</a>
            <a href="#features" className="hover:text-[#D4AF37] transition">Features</a>
            <a href="#faq" className="hover:text-[#D4AF37] transition">FAQ</a>
            <a href="#team" className="hover:text-[#D4AF37] transition">Team</a>
          </div>
        </div>
      </nav>

      {/* ---------- HERO SECTION ---------- */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <NetworkLines />
        <FloatingOrb className="bg-[#00A896] top-1/4 left-1/4" size={350} delay={0} />
        <FloatingOrb className="bg-[#D4AF37] bottom-1/3 right-1/3" size={250} delay={2} />
        <motion.div style={{ y: heroY }} className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.img
            src="/pfurex-analytics-log.png"
            alt="Pfurex Analytics"
            className="mx-auto w-20 md:w-28 mb-8 drop-shadow-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          />
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#D4AF37] via-[#00A896] to-[#D4AF37] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Intelligent Investment Analysis<br/>for Zimbabwean SMEs
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Pfurex Analytics combines AI‑powered extraction, sector‑specific valuation models, and Zimbabwe‑centric risk scoring to give investors and business owners transparent, data‑driven insights.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="#how-it-works" className="bg-[#D4AF37] text-[#0A1929] font-bold px-8 py-4 rounded-full text-lg hover:bg-[#c9a32b] transition shadow-2xl">
              See How It Works
            </a>
            <a href="#contact" className="border border-[#D4AF37] text-[#D4AF37] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#D4AF37] hover:text-[#0A1929] transition">
              Request Access
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- PROBLEM & SOLUTION ---------- */}
      <section id="problem" className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <FadeInView direction="left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The Challenge</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Early‑stage Zimbabwean businesses struggle to attract investment because their financial data is fragmented, often recorded across multiple currencies and mobile money platforms. Investors lack reliable, comparable valuation benchmarks, leading to subjective, time‑consuming decision‑making.
            </p>
            <ul className="space-y-3 text-slate-700 dark:text-slate-400">
              <li className="flex items-start space-x-3">
                <Check className="text-[#00A896] w-6 h-6 mt-0.5 flex-shrink-0" />
                <span>Multi‑currency confusion (ZiG, USD, ZWL, EcoCash)</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="text-[#00A896] w-6 h-6 mt-0.5 flex-shrink-0" />
                <span>Absence of standardised valuation models</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="text-[#00A896] w-6 h-6 mt-0.5 flex-shrink-0" />
                <span>High risk perception due to policy and currency volatility</span>
              </li>
            </ul>
          </FadeInView>
          <FadeInView direction="right">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Solution</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Pfurex Analytics automates the entire investment analysis pipeline. Business owners submit a funding application, upload supporting documents, and our AI instantly generates a complete valuation, risk assessment, and deal structure – backed by transparent, auditable reasoning.
            </p>
            <div className="flex space-x-4">
              <span className="bg-[#D4AF37] text-[#0A1929] px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4" /> AI‑Powered
              </span>
              <span className="bg-[#00A896] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Auditable
              </span>
              <span className="bg-[#0A1929] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Zimbabwe‑First
              </span>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-16">How It Works</h2>
          </FadeInView>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Submit Application", desc: "Business owners fill a structured funding application, upload pitch decks, financials, or EcoCash statements.", icon: <FileText className="w-12 h-12 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300" /> },
              { step: "02", title: "AI Analysis", desc: "Our LLM extracts key data, rates growth factors, and runs Zimbabwe‑specific valuation & risk models.", icon: <Bot className="w-12 h-12 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300" /> },
              { step: "03", title: "Invest with Confidence", desc: "Investors receive a comprehensive, auditable report with transparent scores and editable ratings.", icon: <TrendingUp className="w-12 h-12 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300" /> },
            ].map((item, idx) => (
              <FadeInView key={idx} delay={idx * 0.2}>
                <div className="relative p-8 bg-white dark:bg-[#0A1929] rounded-2xl shadow-xl hover:shadow-2xl transition group">
                  <div className="flex justify-center">{item.icon}</div>
                  <div className="text-5xl font-bold text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300 text-center">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center">{item.desc}</p>
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#00A896] rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- STATS COUNTERS ---------- */}
      <section className="py-20 bg-white dark:bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Trusted by Early Adopters</h2>
          </FadeInView>
          <div className="grid md:grid-cols-2 gap-12">
            <Counter end={2} label="Early Investors" suffix="+" />
            <Counter end={5} label="SMEs" suffix="+" />
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-16">Key Features</h2>
          </FadeInView>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />, title: "Multi‑Method Valuation", text: "Scorecard, Venture Capital, and Risk‑Adjusted models calibrated for Zimbabwean sectors." },
              { icon: <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />, title: "Zimbabwe Risk Scoring", text: "Five‑factor risk model covering policy, currency, management, infrastructure, and competition." },
              { icon: <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />, title: "Multi‑Currency", text: "Seamless handling of USD, ZiG, ZWL, and mobile money statements – all normalised." },
              { icon: <FileText className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />, title: "Document Intelligence", text: "AI reads pitch decks, Excel financials, and PDF statements, extracting key metrics automatically." },
              { icon: <Pencil className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />, title: "Editable Ratings", text: "Investors can override AI ratings with justifications, and recalculate valuations instantly." },
              { icon: <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />, title: "Audit Trail", text: "Every valuation, edit, and document processed is logged for full transparency." },
            ].map((feature, idx) => (
              <FadeInView key={idx} delay={idx * 0.1}>
                <div className="p-8 bg-white dark:bg-[#0A1929] rounded-2xl shadow-lg hover:shadow-xl transition border border-slate-200 dark:border-slate-800">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.text}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          </FadeInView>
          <div>
            <FAQItem question="How accurate is the AI valuation?" answer="Our AI uses established valuation methods (Scorecard, Venture Capital, Risk‑Adjusted) calibrated with Zimbabwe‑specific benchmarks. Results are transparent and editable, allowing investors to apply their own judgment." />
            <FAQItem question="Is my financial data secure?" answer="Absolutely. Pfurex Analytics is designed for on‑premise deployment, meaning your data never leaves your institution's infrastructure. All documents are encrypted at rest and in transit." />
            <FAQItem question="Can I use Pfurex without an internet connection?" answer="Yes – once deployed on your local server, the entire platform works offline. Internet is only needed for initial setup and periodic updates." />
            <FAQItem question="What documents can I upload?" answer="You can upload pitch decks (PDF), financial models (Excel), EcoCash statements, bank statements, and tax returns. Our AI automatically extracts relevant data from each." />
            <FAQItem question="Who can edit the AI ratings?" answer="Only registered investors and admins can override the AI's scores. Every change is logged and auditable, and the original AI ratings are always preserved for comparison." />
          </div>
        </div>
      </section>

      {/* ---------- TEAM ---------- */}
      <section id="team" className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Founder</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-16 max-w-2xl mx-auto">
              Built by a Zimbabwean engineer who understands the challenges facing local businesses.
            </p>
          </FadeInView>
          <FadeInView>
            <div className="max-w-md mx-auto bg-white dark:bg-[#0A1929] p-8 rounded-2xl shadow-2xl border border-[#D4AF37]/20">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37] to-[#00A896] p-1 mb-6 flex items-center justify-center">
                <Users className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Simon Pfuurai</h3>
              <p className="text-[#D4AF37] font-medium">Founder & CEO</p>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                Computer Systems Engineering graduate with a passion for helping businesses scale and reach their potential. Simon combines deep technical expertise with a commitment to unlocking capital for Zimbabwean entrepreneurs.
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ---------- CONTACT / REQUEST DEMO ---------- */}
      <section id="contact" className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-2xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Get in Touch</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-10">
              Interested in a demo or have questions? Send us a message.
            </p>
          </FadeInView>
          {contactSent ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
              <Sparkles className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mt-4">Message Sent!</h3>
              <p className="text-green-600 dark:text-green-400">We'll get back to you shortly.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <input
                type="text" placeholder="Your Name" value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
              />
              <input
                type="email" placeholder="Your Email" value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
              />
              <textarea
                placeholder="Your Message" rows={4} value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
              />
              <button type="submit" className="w-full py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" /> Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="py-24 bg-gradient-to-r from-[#0A1929] via-[#0a1422] to-[#0A1929] text-white text-center">
        <FadeInView>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform SME Investment?</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Join Pfurex Analytics and experience the future of data‑driven, transparent investment analysis.
          </p>
          <a href="#contact" className="inline-block bg-[#D4AF37] text-[#0A1929] font-bold px-10 py-5 rounded-full text-xl hover:bg-[#c9a32b] transition shadow-2xl">
            Request Access
          </a>
        </FadeInView>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-[#0A1929] text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src="/pfurex-analytics-log.png" alt="Pfurex Analytics" className="h-8 w-auto" />
            <span className="text-white font-semibold">Pfurex Analytics</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Pfurex Analytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
