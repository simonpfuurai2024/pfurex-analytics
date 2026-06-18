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
  Mailbox,
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

// ---------- Expandable Section ----------
const ExpandableSection = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left text-lg font-medium text-[#0A1929] dark:text-white focus:outline-none"
      >
        {title}
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
        <div className="pb-5 text-slate-600 dark:text-slate-400">{children}</div>
      </motion.div>
    </div>
  );
};

// ---------- Main Landing Component ----------
const Landing = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('access_key', '112c09ec-d037-4ca5-a22b-0c67a31cf140');
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
            <img src="/pfurex-analytics-log.png" alt="Pfurex Technologies" className="h-10 w-auto" />
            <span className="text-xl font-bold text-[#0A1929] dark:text-white">Pfurex Technologies</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-sm tracking-wide">
            <a href="#solutions" className="hover:text-[#D4AF37] transition">Solutions</a>
            <a href="#why-us" className="hover:text-[#D4AF37] transition">Why Pfurex</a>
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
            AI‑Powered Software for<br/>Zimbabwean Businesses
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We help you make smarter investment decisions and automate your procurement – with secure, end‑to‑end systems designed for Zimbabwe.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="#solutions" className="bg-[#D4AF37] text-[#0A1929] font-bold px-8 py-4 rounded-full text-lg hover:bg-[#c9a32b] transition shadow-2xl">
              See What We Offer
            </a>
            <a href="#contact" className="border border-[#D4AF37] text-[#D4AF37] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#D4AF37] hover:text-[#0A1929] transition">
              Get in Touch
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- SOLUTIONS (PRODUCTS + SERVICES) ---------- */}
      <section id="solutions" className="py-24 bg-white dark:bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What We Offer</h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-16 max-w-2xl mx-auto">
              Clear, practical AI solutions and professional services to grow your business.
            </p>
          </FadeInView>

          {/* Three main cards: Pfurex Analytics, PfurexProcure, Professional Services */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Pfurex Analytics */}
            <FadeInView>
              <div className="bg-[#F8FAFC] dark:bg-[#0a1422] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <BarChart3 className="w-10 h-10 text-[#D4AF37]" />
                  <h3 className="text-2xl font-bold text-[#0A1929] dark:text-white">Pfurex Analytics</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                  AI investment analysis for SMEs. Automatically extract financial data, get valuations, risk scores, and investor‑ready reports.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Multi‑currency (USD, ZiG, ZWL)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Valuation & risk scoring</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Monte Carlo simulations</li>
                </ul>
                <ExpandableSection title="Learn more about Pfurex Analytics">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[#0A1929] dark:text-white">How It Works</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-[#0A1929] rounded-xl">
                        <FileText className="w-8 h-8 text-[#D4AF37] mb-2" />
                        <p className="text-sm font-medium">1. Submit</p>
                        <p className="text-xs text-slate-500">Funding application + documents</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-[#0A1929] rounded-xl">
                        <Bot className="w-8 h-8 text-[#D4AF37] mb-2" />
                        <p className="text-sm font-medium">2. Analyse</p>
                        <p className="text-xs text-slate-500">AI extracts data & runs models</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-[#0A1929] rounded-xl">
                        <TrendingUp className="w-8 h-8 text-[#D4AF37] mb-2" />
                        <p className="text-sm font-medium">3. Decide</p>
                        <p className="text-xs text-slate-500">Investor‑ready report</p>
                      </div>
                    </div>
                    <h4 className="font-semibold text-[#0A1929] dark:text-white mt-4">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-[#00A896]" /> Multi‑method valuation</div>
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-[#00A896]" /> Zimbabwe risk scoring</div>
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-[#00A896]" /> Multi‑currency</div>
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-[#00A896]" /> Document intelligence</div>
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-[#00A896]" /> Editable ratings</div>
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-[#00A896]" /> Full audit trail</div>
                    </div>
                    <h4 className="font-semibold text-[#0A1929] dark:text-white mt-4">FAQ</h4>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                      <p><strong>Q: Is my data secure?</strong> Yes – on‑premise deployment keeps data in‑country.</p>
                      <p><strong>Q: Can I use it offline?</strong> Yes, after initial setup.</p>
                      <p><strong>Q: Who can edit AI ratings?</strong> Only registered investors/admins.</p>
                    </div>
                  </div>
                </ExpandableSection>
              </div>
            </FadeInView>

            {/* PfurexProcure */}
            <FadeInView>
              <div className="bg-[#F8FAFC] dark:bg-[#0a1422] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <ClipboardCheck className="w-10 h-10 text-[#D4AF37]" />
                  <h3 className="text-2xl font-bold text-[#0A1929] dark:text-white">PfurexProcure</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                  AI procurement agent that automates your entire purchasing process – from vendor search to negotiation.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Vendor search & communication</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Fair price analytics</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00A896]" /> Approval automation</li>
                </ul>
                <a href="#contact" className="text-[#D4AF37] font-semibold hover:underline mt-auto">Request a demo →</a>
              </div>
            </FadeInView>

            {/* Professional Services */}
            <FadeInView>
              <div className="bg-[#F8FAFC] dark:bg-[#0a1422] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <Wrench className="w-10 h-10 text-[#D4AF37]" />
                  <h3 className="text-2xl font-bold text-[#0A1929] dark:text-white">Professional Services</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                  From custom software to business email setup, we build and support the tools your business needs.
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Code2 className="w-4 h-4 text-[#00A896]" /> Custom software development</li>
                  <li className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-[#00A896]" /> AI agent deployment</li>
                  <li className="flex items-center gap-2"><Palette className="w-4 h-4 text-[#00A896]" /> Website & logo design</li>
                  <li className="flex items-center gap-2"><Search className="w-4 h-4 text-[#00A896]" /> SEO</li>
                  <li className="flex items-center gap-2"><Share2 className="w-4 h-4 text-[#00A896]" /> Social media automation</li>
                  <li className="flex items-center gap-2"><Megaphone className="w-4 h-4 text-[#00A896]" /> Graphics design</li>
                  <li className="flex items-center gap-2"><Mailbox className="w-4 h-4 text-[#00A896]" /> Business email setup</li>
                </ul>
                <a href="#contact" className="text-[#D4AF37] font-semibold hover:underline mt-auto">Request a quote →</a>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ---------- WHY PFUREX ---------- */}
      <section id="why-us" className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Pfurex?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
              We don't just write code – we deliver complete, secure systems from hardware to software.
            </p>
          </FadeInView>
          <div className="grid md:grid-cols-3 gap-10">
            <FadeInView>
              <div className="p-6 bg-white dark:bg-[#0A1929] rounded-2xl shadow-md hover:shadow-lg transition border border-slate-200 dark:border-slate-800">
                <Server className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">End‑to‑End Systems</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Hardware, networking, and software – we handle everything so you can focus on your business.</p>
              </div>
            </FadeInView>
            <FadeInView>
              <div className="p-6 bg-white dark:bg-[#0A1929] rounded-2xl shadow-md hover:shadow-lg transition border border-slate-200 dark:border-slate-800">
                <Lock className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Cybersecurity First</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">AES‑256 encryption, role‑based access, and audit trails built into every deployment.</p>
              </div>
            </FadeInView>
            <FadeInView>
              <div className="p-6 bg-white dark:bg-[#0A1929] rounded-2xl shadow-md hover:shadow-lg transition border border-slate-200 dark:border-slate-800">
                <Cpu className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Local AI & Data Sovereignty</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Custom LLMs that run on your own infrastructure – your data never leaves Zimbabwe.</p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ---------- ABOUT / MISSION ---------- */}
      <section id="about" className="py-24 bg-white dark:bg-[#0A1929]">
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
              From hardware infrastructure to AI‑powered platforms, we deliver complete, secure systems – not just code. Cybersecurity and data sovereignty are at the heart of everything we build.
            </p>
          </FadeInView>
          <FadeInView>
            <div className="bg-[#F8FAFC] dark:bg-[#0a1422] p-8 rounded-2xl shadow-2xl border border-[#D4AF37]/20 text-center">
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
      <section id="contact" className="py-24 bg-[#F8FAFC] dark:bg-[#0a1422]">
        <div className="max-w-2xl mx-auto px-6">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Get in Touch</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-10">
              Ready to discuss a project? Send us a message and we'll get back to you.
            </p>
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
              <input type="text" placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition" />
              <input type="email" placeholder="Your Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition" />
              <textarea placeholder="Your Message" rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none" />
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
