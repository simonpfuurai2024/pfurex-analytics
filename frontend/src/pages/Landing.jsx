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
  Mail,
  ChevronDown,
  Wrench,
  Server,
  Network,
  Lock,
  Cpu,
  Globe,
  Search,
  MessageSquare,
  DollarSign,
  ClipboardCheck,
  Megaphone,
  Palette,
  Share2,
  Code2,
  BrainCircuit,
  Phone,
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
    const formData = new FormData();
    formData.append('access_key', '112c09ec-d037-4ca5-a22b-0c67a31cf140'); // Replace with your Web3Forms key
    formData.append('name', contactForm.name);
    formData.append('email', contactForm.email);
    formData.append('message', contactForm.message);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setContactSent(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setContactSent(false), 5000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] dark:bg-[#0A1929] dark:text-slate-100 font-sans">
      {/* ---------- NAVBAR ---------- */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0A1929]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/pfurex-analytics-log.png" alt="Pfurex Analytics" className="h-10 w-auto" />
            <span className="text-xl font-bold text-[#0A1929] dark:text-white">Pfurex Technologies</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-sm tracking-wide">
            <a href="#products" className="hover:text-[#D4AF37] transition">Products</a>
            <a href="#services" className="hover:text-[#D4AF37] transition">Services</a>
            <a href="#about" className="hover:text-[#D4AF37] transition">About</a>
            <a href="#contact" className="hover:text-[#D4AF37] transition">Contact</a>
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
            alt="Pfurex Technologies"
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
            Building Intelligent Software<br/>that Unlocks Zimbabwean Business Potential
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            End‑to‑end systems from hardware infrastructure to AI‑powered platforms, designed with cybersecurity at the core.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="#products" className="bg-[#D4AF37] text-[#0A1929] font-bold px-8 py-4 rounded-full text-lg hover:bg-[#c9a32b] transition shadow-2xl">
              Explore Products
            </a>
            <a href="#contact" className="border border-[#D4AF37] text-[#D4AF37] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#D4AF37] hover:text-[#0A1929] transition">
              Get in Touch
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- PRODUCTS ---------- */}
      <section id="products" className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Flagship Products</h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-16 max-w-2xl mx-auto">
              Powerful AI‑driven solutions designed for Zimbabwean businesses.
            </p>
          </FadeInView>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Pfurex Analytics */}
            <FadeInView>
              <div className="bg-[#F8FAFC] dark:bg-[#0a1422] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center gap-4 mb-6">
                  <BarChart3 className="w-10 h-10 text-[#D4AF37]" />
                  <h3 className="text-2xl font-bold text-[#0A1929] dark:text-white">Pfurex Analytics</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  AI‑powered investment analysis platform. Automates financial data extraction, multi‑method valuation, and Zimbabwe‑specific risk scoring to bridge the gap between SMEs and investors.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Multi‑currency normalisation</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Monte Carlo simulations</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Investor‑ready audit reports</li>
                </ul>
                <a href="#pfurex-analytics" className="text-[#D4AF37] font-semibold hover:underline">Learn more →</a>
              </div>
            </FadeInView>

            {/* PfurexProcure */}
            <FadeInView>
              <div className="bg-[#F8FAFC] dark:bg-[#0a1422] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center gap-4 mb-6">
                  <ClipboardCheck className="w-10 h-10 text-[#D4AF37]" />
                  <h3 className="text-2xl font-bold text-[#0A1929] dark:text-white">PfurexProcure</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  AI procurement agentic system. End‑to‑end procurement automation: requisition analysis, vendor search, voice & text communication, fair‑price ML analytics, quotation analysis, and price negotiation.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Vendor search & communication</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Fair price analytics</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Approval automation</li>
                </ul>
                <a href="#contact" className="text-[#D4AF37] font-semibold hover:underline">Request demo →</a>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section id="services" className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Services We Offer</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
              We don't just deploy software — we build complete, secure systems from the ground up.
            </p>
          </FadeInView>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Code2 className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Custom Software Development", desc: "Tailored applications for your business processes, built with modern, scalable technologies." },
              { icon: <BrainCircuit className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "AI Agent Development & Deployment", desc: "Intelligent agents that automate workflows, from procurement to customer service." },
              { icon: <Palette className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Website & Logo Design", desc: "Beautiful, responsive websites and memorable brand identities that stand out." },
              { icon: <Search className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "SEO", desc: "Data‑driven search engine optimisation to get your business found online." },
              { icon: <Share2 className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Social Media Integration & Automation", desc: "Automated posting, scheduling, and engagement across all major platforms." },
              { icon: <Megaphone className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Graphics Design", desc: "Professional graphics for print and digital — from brochures to social media kits." },
            ].map((service, idx) => (
              <FadeInView key={idx} delay={idx * 0.1}>
                <div className="p-6 bg-white dark:bg-[#0A1929] rounded-2xl shadow-md hover:shadow-lg transition border border-slate-200 dark:border-slate-800">
                  {service.icon}
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{service.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW WE WORK (END-TO-END) ---------- */}
      <section className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">End‑to‑End Systems, Secured</h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-16 max-w-3xl mx-auto">
              We handle everything from hardware installation and network infrastructure to software deployment — and we lock it all down with enterprise‑grade cybersecurity.
            </p>
          </FadeInView>
          <div className="grid md:grid-cols-3 gap-10">
            <FadeInView>
              <div className="text-center p-6">
                <Server className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Hardware & Infrastructure</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Procurement, setup, and maintenance of servers, networking equipment, and on‑premise systems.</p>
              </div>
            </FadeInView>
            <FadeInView>
              <div className="text-center p-6">
                <Network className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Network Architecture</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Secure, redundant networks designed for performance and compliance with local data regulations.</p>
              </div>
            </FadeInView>
            <FadeInView>
              <div className="text-center p-6">
                <Lock className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Cybersecurity First</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">AES‑256 encryption, RBAC, immutable audit logs, and regular penetration testing baked into every deployment.</p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ---------- DATA SOVEREIGNTY / LOCAL LLM ---------- */}
      <section className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInView>
            <Cpu className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Localised AI for Data Sovereignty</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto text-lg">
              We develop custom, localised Large Language Models (LLMs) that run entirely within your infrastructure — no foreign APIs, no data leaks. Your sensitive information stays in Zimbabwe, under your control.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* ---------- PFUREX ANALYTICS DETAIL (HOW IT WORKS, FEATURES, FAQ) ---------- */}
      <section id="pfurex-analytics" className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Inside Pfurex Analytics</h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-16">The AI‑powered investment analysis platform in detail.</p>
          </FadeInView>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-10 mb-24">
            {[
              { step: "01", title: "Submit Application", desc: "Business owners fill a structured funding application, upload pitch decks, financials, or EcoCash statements.", icon: <FileText className="w-12 h-12 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300" /> },
              { step: "02", title: "AI Analysis", desc: "Our LLM extracts key data, rates growth factors, and runs Zimbabwe‑specific valuation & risk models.", icon: <Bot className="w-12 h-12 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300" /> },
              { step: "03", title: "Invest with Confidence", desc: "Investors receive a comprehensive, auditable report with transparent scores and editable ratings.", icon: <TrendingUp className="w-12 h-12 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300" /> },
            ].map((item, idx) => (
              <FadeInView key={idx} delay={idx * 0.2}>
                <div className="relative p-8 bg-[#F8FAFC] dark:bg-[#0A1929] rounded-2xl shadow-xl hover:shadow-2xl transition group">
                  <div className="flex justify-center">{item.icon}</div>
                  <div className="text-5xl font-bold text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300 text-center">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3 text-center">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center">{item.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>

          {/* Features */}
          <h3 className="text-2xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: <BarChart3 className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Multi‑Method Valuation", text: "Scorecard, Venture Capital, and Risk‑Adjusted models calibrated for Zimbabwean sectors." },
              { icon: <ShieldCheck className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Zimbabwe Risk Scoring", text: "Five‑factor risk model covering policy, currency, management, infrastructure, and competition." },
              { icon: <ArrowLeftRight className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Multi‑Currency", text: "Seamless handling of USD, ZiG, ZWL, and mobile money statements." },
              { icon: <FileText className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Document Intelligence", text: "AI reads pitch decks, Excel financials, and PDF statements automatically." },
              { icon: <Pencil className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Editable Ratings", text: "Investors override AI ratings with justifications and recalculate." },
              { icon: <TrendingUp className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />, title: "Audit Trail", text: "Every valuation, edit, and document is logged for full transparency." },
            ].map((feature, idx) => (
              <FadeInView key={idx} delay={idx * 0.1}>
                <div className="p-6 bg-[#F8FAFC] dark:bg-[#0A1929] rounded-2xl shadow-lg hover:shadow-xl transition border border-slate-200 dark:border-slate-800 text-center">
                  {feature.icon}
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.text}</p>
                </div>
              </FadeInView>
            ))}
          </div>

          {/* FAQ */}
          <h3 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h3>
          <div className="max-w-3xl mx-auto">
            <FAQItem question="How accurate is the AI valuation?" answer="Our AI uses established valuation methods calibrated with Zimbabwe‑specific benchmarks. Results are transparent and editable, allowing investors to apply their own judgment." />
            <FAQItem question="Is my financial data secure?" answer="Absolutely. Pfurex Analytics is designed for on‑premise deployment — your data never leaves your institution's infrastructure. All documents are encrypted at rest and in transit." />
            <FAQItem question="Can I use Pfurex without an internet connection?" answer="Yes — once deployed on your local server, the entire platform works offline. Internet is only needed for initial setup and updates." />
            <FAQItem question="What documents can I upload?" answer="Pitch decks (PDF), financial models (Excel), EcoCash statements, bank statements, and tax returns. Our AI automatically extracts relevant data from each." />
            <FAQItem question="Who can edit the AI ratings?" answer="Only registered investors and admins can override the AI's scores. Every change is logged and auditable." />
          </div>
        </div>
      </section>

      {/* ---------- ABOUT / MISSION ---------- */}
      <section id="about" className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Pfurex Technologies</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              We are a Zimbabwean software systems development startup dedicated to building intelligent solutions that unlock business potential.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              Our mission: <strong>“Building intelligent software that unlocks Zimbabwean business potential.”</strong>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              From hardware infrastructure to AI‑powered platforms, we deliver complete, secure systems — not just code. Cybersecurity and data sovereignty are at the heart of everything we build.
            </p>
          </FadeInView>
          <FadeInView>
            <div className="bg-white dark:bg-[#0A1929] p-8 rounded-2xl shadow-2xl border border-[#D4AF37]/20 text-center">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37] to-[#00A896] p-1 mb-6 flex items-center justify-center">
                <Users className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Simon Pfuurai</h3>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Computer Systems Engineering graduate with a passion for helping businesses scale through technology.
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section id="contact" className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-2xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Get in Touch</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-10">
              Ready to discuss a project? Send us a message and we'll get back to you.
            </p>
            {/* Contact Details */}
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-10 text-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-[#D4AF37]" />
                <span>+263 777 294 079</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
                <span>simonpfuuraiprojects@gmail.com</span>
              </div>
            </div>
          </FadeInView>
          {contactSent ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
              <Sparkles className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mt-4">Message Sent!</h3>
              <p className="text-green-600 dark:text-green-400">We'll get back to you shortly.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <input type="text" placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition" />
              <input type="email" placeholder="Your Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition" />
              <textarea placeholder="Your Message" rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none" />
              <button type="submit" className="w-full py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" /> Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-[#0A1929] text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src="/pfurex-analytics-log.png" alt="Pfurex Technologies" className="h-8 w-auto" />
            <span className="text-white font-semibold">Pfurex Technologies</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Pfurex Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
