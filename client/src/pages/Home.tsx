import { useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowUpRight, Github, Mail, MessageCircle, Linkedin, ExternalLink,
  MapPin, Briefcase, Zap, Users, FileText, Settings, ChevronDown,
  Code2, Globe, Star, Activity, Clock, CheckCircle2, PauseCircle,
  Send, Phone, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/* ── Animation helpers ─────────────────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65 } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const vp = { once: true, amount: 0.2 };

/* ── Data ──────────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Automations", href: "#automations" },
  { label: "Skills", href: "#skills" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const TITLES = [
  "Operations Lead",
  "Automation Specialist",
  "Project Coordinator",
  "Administrative Professional",
];

const STATS = [
  { value: "3+", label: "Years BPO Leadership" },
  { value: "200+", label: "Hires Coordinated" },
  { value: "15+", label: "Tools Mastered" },
  { value: "1,900+", label: "Automation Runs" },
];

const EXPERIENCE = [
  {
    period: "Mar 2026 — Present",
    role: "Operations Business Development",
    company: "House of Lettings",
    location: "Remote (UK)",
    type: "Current",
    description:
      "Started as Executive Assistant providing executive-level administrative support — calendar management, CRM maintenance, and document production — before progressing through Operations Manager, where I built TimeCRM (a real-time multi-agent time tracking system synced with Google Sheets via Apps Script), and into my current Operations Business Development role, where I drive growth initiatives, identify new client opportunities, and expand the company's property management portfolio across the UK market.",
    tags: ["Operations", "Business Development", "TimeCRM", "CRM", "Google Apps Script", "Remote Ops"],
    color: "primary",
  },
  {
    period: "Jun 2025 — Present",
    role: "Automation Specialist",
    company: "24fingers",
    location: "Remote (UK)",
    type: "Current",
    description:
      "Building and maintaining Make.com automation workflows for a UK digital agency. Delivered 15 production automations integrating Calendly, Capsule CRM, Campaign Monitor, Google Sheets, Microsoft Email, Formaloo, and OpenAI — totalling 1,900+ successful executions.",
    tags: ["Make.com", "CRM Automation", "Calendly", "Campaign Monitor", "OpenAI"],
    color: "gold",
  },
  {
    period: "Jan 2025 — Mar 2026",
    role: "Customer Service Digital Team Leader",
    company: "Tech Mahindra",
    location: "Cebu City, Philippines",
    type: "Previous",
    description:
      "Led a digital customer service team across chat and digital channels. Drove CSAT improvement initiatives, coached agents, and maintained KPI compliance in a high-volume BPO environment.",
    tags: ["Team Leadership", "CSAT", "Digital Channels", "LiveEngage"],
    color: "muted",
  },
  {
    period: "May 2024 — Jan 2025",
    role: "Technical Support Team Leader",
    company: "Tech Mahindra",
    location: "Cebu City, Philippines",
    type: "Previous",
    description:
      "Managed a technical support team, handled complex escalations, and implemented structured coaching frameworks. Recognized for process improvement that reduced AHT and improved FCR metrics.",
    tags: ["Tech Support", "Escalation Handling", "AHT Reduction", "FCR"],
    color: "muted",
  },
  {
    period: "2022 — May 2024",
    role: "Complaints Manager & Senior Agent",
    company: "Tech Mahindra",
    location: "BPO Industry",
    type: "Previous",
    description:
      "Managed complex complaint resolution, maintained SLA compliance, and served as escalation point. Also coordinated a 200-hire recruitment campaign for Largen Med Inc. across multiple Philippine regions.",
    tags: ["Complaints Mgmt", "Recruitment", "SLA", "Stakeholder Mgmt"],
    color: "muted",
  },
];

const PROJECTS = [
  {
    name: "House of Lettings",
    repo: "houseoflettings",
    description:
      "Full-stack UK property rental platform built with Next.js 14 (App Router) and Firebase. Features multi-role auth (landlord/tenant/admin), property listings with image upload, and role-based dashboards.",
    tags: ["Next.js 14", "Firebase", "TypeScript", "Firestore"],
    url: "https://github.com/markravencanete50-source/houseoflettings",
    icon: "🏠",
    category: "Full-Stack Platform",
  },
  {
    name: "EasyHomeFix",
    repo: "easyhomefix",
    description:
      "Production-ready property maintenance management platform with multi-role system (Tenant, Property Manager, Contractor, Admin), real-time ticket tracking, push notifications, and analytics dashboard.",
    tags: ["React", "TypeScript", "Firebase", "Recharts"],
    url: "https://github.com/markravencanete50-source/easyhomefix",
    icon: "🔧",
    category: "SaaS Platform",
  },
  {
    name: "Landlord Matching",
    repo: "Landlord-Matching",
    description:
      "UK property management and landlord matching system with instant valuation, full assessment flows, and admin panel. Built with Next.js and Firebase for House of Lettings.",
    tags: ["Next.js", "Firebase", "TypeScript", "Tailwind"],
    url: "https://github.com/markravencanete50-source/Landlord-Matching",
    icon: "🔑",
    category: "Property Tech",
  },
  {
    name: "Account Dashboard",
    repo: "account-dashboard",
    description:
      "House of Lettings property ledger — a financial tracking dashboard with money-in/money-out visibility per property. Built with Next.js, Space Grotesk typography, and Firebase auth.",
    tags: ["Next.js", "TypeScript", "Firebase", "Dashboard"],
    url: "https://github.com/markravencanete50-source/account-dashboard",
    icon: "📊",
    category: "Financial Dashboard",
  },
  {
    name: "OutsourcEdge",
    repo: "outsourcedge",
    description:
      "Full-stack business website for an outsourcing agency. Features Firebase-backed CMS, lead capture, AI assistant (Aria) powered by Groq, protected admin panel, and Firestore-driven content management.",
    tags: ["React 19", "Firebase", "TypeScript", "Framer Motion"],
    url: "https://github.com/markravencanete50-source/outsourcedge",
    icon: "🚀",
    category: "Business Website",
  },
  {
    name: "Raven Portfolio",
    repo: "raven-portfolio",
    description:
      "Original personal portfolio website deployed on Cloudflare Workers. A cinematic dark-themed single-page portfolio with animated hero, scroll-reveal sections, and tools ticker.",
    tags: ["HTML", "CSS", "JavaScript", "Cloudflare Workers"],
    url: "https://github.com/markravencanete50-source/raven-portfolio",
    icon: "🎨",
    category: "Portfolio",
  },
];

const AUTOMATIONS = [
  {
    id: 9352038,
    name: "Handy Fixes Prospect Automation",
    description:
      "Watches incoming Microsoft Outlook emails, parses prospect data using regex, then routes to Capsule CRM — creating new contacts or updating existing ones automatically. Highest-volume automation with 1,048 executions.",
    tools: ["Microsoft Email", "Regex Parser", "Capsule CRM"],
    executions: 1048,
    isActive: true,
    category: "Lead Management",
    icon: "📧",
  },
  {
    id: 9350411,
    name: "Monthly Tax Invoice",
    description:
      "Monitors Microsoft Outlook for incoming tax invoice emails and automatically forwards them to the appropriate recipient — ensuring no invoice is missed in the monthly billing cycle.",
    tools: ["Microsoft Email"],
    executions: 528,
    isActive: true,
    category: "Finance Automation",
    icon: "🧾",
  },
  {
    id: 9393195,
    name: "DMCC Content Plan Automation",
    description:
      "Watches for cell updates in a Google Sheet content calendar and automatically sends a formatted Microsoft Email notification — keeping the DMCC content team aligned on schedule changes in real time.",
    tools: ["Google Sheets", "Microsoft Email"],
    executions: 267,
    isActive: true,
    category: "Content Operations",
    icon: "📅",
  },
  {
    id: 9351976,
    name: "Order Notification — Seven Easy Ways",
    description:
      "Monitors Outlook for incoming order emails, parses order details with regex, then routes to Capsule CRM to create or update contact records. Processed 312 order notifications.",
    tools: ["Microsoft Email", "Regex Parser", "Capsule CRM"],
    executions: 312,
    isActive: false,
    category: "Order Management",
    icon: "📦",
  },
  {
    id: 9323242,
    name: "Meetgeek Automation",
    description:
      "Complex multi-tool automation that processes Meetgeek meeting summaries via webhook, enriches them with OpenAI GPT, parses JSON output, updates Capsule CRM contact records, and sends a structured follow-up email via Microsoft Outlook. Intentionally paused for reconfiguration.",
    tools: ["Webhook", "OpenAI GPT", "JSON Parser", "Capsule CRM", "Microsoft Email", "HTTP"],
    executions: 223,
    isActive: false,
    isComplex: true,
    category: "Meeting Intelligence",
    icon: "🤖",
  },
  {
    id: 9351948,
    name: "Calendly 30 Min — Partners",
    description:
      "Triggered on new Calendly bookings for 30-minute partner calls. Searches Capsule CRM for the contact, routes to create or update, then subscribes them to the appropriate Campaign Monitor email list.",
    tools: ["Calendly", "Capsule CRM", "Campaign Monitor"],
    executions: 39,
    isActive: true,
    category: "CRM + Email",
    icon: "📆",
  },
  {
    id: 9349236,
    name: "Power Hour",
    description:
      "Handles Calendly Power Hour session bookings — searches and routes contacts in Capsule CRM, then adds them to the correct Campaign Monitor subscriber list for follow-up sequences.",
    tools: ["Calendly", "Capsule CRM", "Campaign Monitor"],
    executions: 38,
    isActive: true,
    category: "CRM + Email",
    icon: "⚡",
  },
  {
    id: 9314287,
    name: "Digital Health Session",
    description:
      "Webhook-triggered automation that captures Digital Health Session form submissions, searches Capsule CRM for the contact, and creates or updates the party record with session details.",
    tools: ["Webhook (Gateway)", "Capsule CRM"],
    executions: 18,
    isActive: true,
    category: "Lead Capture",
    icon: "💊",
  },
  {
    id: 9437053,
    name: "BlogSignUps",
    description:
      "Watches Campaign Monitor for new blog subscribers, searches Capsule CRM for the contact, then routes to either update the existing record or create a new one — keeping the CRM in sync with email list growth.",
    tools: ["Campaign Monitor", "Capsule CRM"],
    executions: 15,
    isActive: true,
    category: "Email + CRM",
    icon: "✉️",
  },
  {
    id: 9415395,
    name: "Formaloo Digital Strategy Proposal",
    description:
      "Triggered by new Formaloo form responses, makes an HTTP request to enrich the data, then searches and routes the contact in Capsule CRM — automating the digital strategy proposal intake pipeline.",
    tools: ["Formaloo", "HTTP", "Capsule CRM"],
    executions: 16,
    isActive: true,
    category: "Lead Capture",
    icon: "📋",
  },
  {
    id: 9416399,
    name: "Clients",
    description:
      "Calendly-triggered workflow for client onboarding bookings. Searches Capsule CRM, routes to update or create the contact record, and syncs with Campaign Monitor subscriber lists.",
    tools: ["Calendly", "Capsule CRM", "Campaign Monitor"],
    executions: 5,
    isActive: true,
    category: "Client Onboarding",
    icon: "🤝",
  },
  {
    id: 9314310,
    name: "Growth Strategy Session",
    description:
      "Handles Calendly Growth Strategy Session bookings — searches Capsule CRM and creates or updates the contact record to ensure every strategy session lead is captured in the CRM.",
    tools: ["Calendly", "Capsule CRM"],
    executions: 4,
    isActive: true,
    category: "CRM",
    icon: "📈",
  },
  {
    id: 9437500,
    name: "Gmail Contacts Auto-Tag",
    description:
      "Watches for new Capsule CRM party entries and automatically applies relevant tags based on contact attributes — keeping the CRM database organized and segmented for targeted outreach.",
    tools: ["Capsule CRM"],
    executions: 0,
    isActive: true,
    category: "CRM Hygiene",
    icon: "🏷️",
  },
  {
    id: 9350414,
    name: "Hill House Interiors — Google Alerts",
    description:
      "Monitors Gmail for Google Alert notifications about Hill House Interiors and automatically forwards relevant mentions to the designated inbox — keeping the team informed of brand coverage.",
    tools: ["Gmail"],
    executions: 7,
    isActive: false,
    category: "Brand Monitoring",
    icon: "🔔",
  },
  {
    id: 9255690,
    name: "Integration Teamwork",
    description:
      "Webhook-triggered scenario that integrates with Teamwork project management — designed to bridge incoming webhook data with Teamwork task creation for seamless project tracking.",
    tools: ["Webhook (Gateway)", "Teamwork"],
    executions: 0,
    isActive: false,
    category: "Project Management",
    icon: "🔗",
  },
];

const SKILLS = [
  {
    icon: Settings,
    title: "Operations & Project Mgmt",
    items: ["Workflow design & SOP documentation", "Monday.com, Trello, Notion, ClickUp", "KPI dashboards & reporting", "Process improvement & gap analysis"],
  },
  {
    icon: Users,
    title: "Team Leadership & Coaching",
    items: ["Direct team leadership in BPO", "Performance management frameworks", "1:1 coaching & career development", "Escalation handling & resolution"],
  },
  {
    icon: Zap,
    title: "Automation (Make / Zapier)",
    items: ["Make.com scenario design & build", "CRM + email list integrations", "Webhook & API-based workflows", "Multi-tool pipeline automation"],
  },
  {
    icon: Code2,
    title: "Tools & Tech Stack",
    items: ["Salesforce, HubSpot, Google Workspace", "Google Apps Script, Excel, Sheets", "Canva, Loom, CapCut, RingCentral", "Zapier, Make, PandaDoc, Formaloo"],
  },
  {
    icon: Briefcase,
    title: "Recruitment & VA",
    items: ["End-to-end recruitment coordination", "Mass hiring (200+ candidates)", "Freelance VA — Upwork & OnlineJobs.ph", "Client proposals & onboarding"],
  },
  {
    icon: FileText,
    title: "Content & Document Ops",
    items: ["ATS-optimized resume & portfolio writing", "Operations manuals & SOPs", "LinkedIn & personal branding", "Presentations & pitch decks"],
  },
];

const SERVICES = [
  {
    number: "01",
    icon: Settings,
    title: "Operations Management",
    description:
      "Full-cycle operations support — SOP creation, workflow automation, KPI monitoring, and team performance systems. BPO-grade discipline applied to remote teams.",
    tags: ["SOPs", "KPI Tracking", "Process Design", "Remote Ops"],
  },
  {
    number: "02",
    icon: Briefcase,
    title: "Virtual Assistance & Admin",
    description:
      "Executive-level VA support — calendar management, CRM maintenance, data entry, reporting, email management, and document production, delivered with precision.",
    tags: ["Calendar Mgmt", "CRM", "Email Mgmt", "Reporting"],
  },
  {
    number: "03",
    icon: Users,
    title: "Recruitment Coordination",
    description:
      "End-to-end recruitment: sourcing, screening, scheduling, virtual interviews, offer coordination, and onboarding. Proven across mass hiring at scale.",
    tags: ["Sourcing", "Screening", "Virtual Interviews", "Onboarding"],
  },
  {
    number: "04",
    icon: Globe,
    title: "Website Creation",
    description:
      "Design and development of professional websites and web applications — from property platforms and business landing pages to full-stack dashboards. Built with modern tech stacks including React, Next.js, TypeScript, and Firebase.",
    tags: ["React", "Next.js", "TypeScript", "Firebase", "Full-Stack"],
  },
  {
    number: "05",
    icon: Zap,
    title: "Automation (Make.com)",
    description:
      "End-to-end automation design and build using Make.com — connecting your CRM, email platform, calendar, forms, and APIs into seamless, no-touch workflows. From simple notification triggers to complex multi-step pipelines with OpenAI, webhooks, and data routing. 15 production scenarios built, 2,500+ executions delivered.",
    tags: ["Make.com", "CRM Integration", "Webhooks", "API Routing", "OpenAI", "Zapier"],
  },
];

const TOOLS_TICKER = [
  "Salesforce", "Monday.com", "Notion", "Trello", "ClickUp", "Google Workspace",
  "HubSpot", "Zapier", "Make.com", "PandaDoc", "Looker Studio", "Canva",
  "Loom", "CapCut", "RingCentral", "LiveEngage", "Outlook", "Excel",
  "Google Sheets", "Formaloo", "Capsule CRM", "Campaign Monitor", "Teamwork",
];

/* ── Typewriter hook ───────────────────────────────────────────────────────── */
function useTypewriter(texts: string[], speed = 60, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [titleIdx, setTitleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[titleIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTitleIdx((i) => (i + 1) % texts.length);
    }

    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, titleIdx, texts, speed, pause]);

  return display;
}

/* ── Intersection-aware section wrapper ────────────────────────────────────── */
function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <section id={id} ref={ref} className={`section-padding ${className}`}>
      <motion.div
        className="container"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ── Section header ────────────────────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-12 max-w-2xl">
      <motion.p variants={fadeUp} className="eyebrow mb-3">{eyebrow}</motion.p>
      <motion.h2 variants={fadeUp} className="text-3xl font-display font-bold md:text-4xl text-foreground">
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="mt-4 text-muted-foreground leading-7">
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function Home() {
  const typedTitle = useTypewriter(TITLES, 55, 2200);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "", service: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent! I'll get back to you soon.");
      setContactForm({ name: "", email: "", subject: "", message: "", service: "" });
      setFormSubmitting(false);
    },
    onError: (err) => {
      toast.error("Failed to send. Please try again or email me directly.");
      setFormSubmitting(false);
      console.error(err);
    },
  });

  /* Track active section on scroll */
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setFormSubmitting(true);
    submitContact.mutate(contactForm);
  };

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── STICKY NAV ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <a href="#" className="font-display font-bold text-lg tracking-tight">
            MR<span className="text-primary">.</span>Cañete
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  activeSection === link.href.replace("#", "")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left px-3 py-2.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
          aria-hidden="true"
        />
        {/* Radial glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="container relative z-10 py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl"
          >
            {/* Location badge */}
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Available for Remote Work · Bohol, Philippines
            </motion.div>

            {/* Name */}
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-display font-bold leading-[1.05] mb-4">
              Mark{" "}
              <span className="gradient-text">Raven</span>
              <br />
              Cañete
            </motion.h1>

            {/* Typewriter titles */}
            <motion.div variants={fadeUp} className="h-8 mb-6">
              <p className="text-lg md:text-xl font-mono text-primary typewriter-caret">
                {typedTitle}
              </p>
            </motion.div>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-8 max-w-2xl mb-10">
              Building scalable operations systems, automating workflows with Make.com, and delivering measurable results across BPO, property management, and digital agency environments.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
                onClick={() => scrollTo("#projects")}
              >
                View Projects <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary font-semibold px-8"
                onClick={() => scrollTo("#contact")}
              >
                Let's Connect
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground text-xs"
          >
            <span className="font-mono tracking-widest uppercase">Scroll</span>
            <ChevronDown className="h-4 w-4 scroll-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <div className="border-y border-border bg-card">
        <div className="container grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {STATS.map((stat) => (
            <div key={stat.label} className="py-8 px-6 text-center">
              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ──────────────────────────────────────────────────────────── */}
      <Section id="about" className="bg-background">
        <SectionHeader
          eyebrow="01 — Who I Am"
          title={<>Operations Leader. <span className="gradient-text">Systems Thinker.</span></>}
        />
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div variants={fadeUp} className="space-y-5 text-muted-foreground leading-7">
            <p>
              With over 3 years embedded in BPO operations leadership, I've led high-performing teams, resolved complex escalations, and architected workflow systems that cut inefficiencies and elevate performance — most recently at Tech Mahindra, Cebu City.
            </p>
            <p>
              Today I bring that same precision to remote project management, automation engineering, and virtual assistance — helping businesses scale without the overhead. From building 15 production Make.com automations at 24fingers to developing TimeCRM for a UK property lettings company, I turn operational complexity into clean, documented processes.
            </p>
            <blockquote className="border-l-2 border-primary pl-4 italic text-foreground/80">
              "I don't just manage tasks — I build the systems that make teams thrive."
            </blockquote>
          </motion.div>

          <motion.div variants={fadeUp} className="card-surface p-6 space-y-4">
            {[
              { label: "Location", value: "Bohol, Philippines" },
              { label: "Current Roles", value: "Ops & Admin · House of Lettings | Automation Specialist · 24fingers" },
              { label: "Availability", value: "Open to Freelance / VA / Remote" },
              { label: "LinkedIn", value: "linkedin.com/in/markravecan" },
              { label: "Certification", value: "TSA Certified · 2026 🏅" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border last:border-0">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider min-w-[110px]">{item.label}</span>
                <span className="text-sm text-foreground">{item.value}</span>
              </div>
            ))}
            <div className="pt-2 flex flex-wrap gap-2">
              {["BPO Leadership", "Remote Ops", "CRM Systems", "Recruitment", "Make.com", "Project Mgmt"].map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── EXPERIENCE ─────────────────────────────────────────────────────── */}
      <Section id="experience" className="bg-card/30">
        <SectionHeader
          eyebrow="02 — Career Path"
          title={<>Crafted through <span className="gradient-text">real leadership.</span></>}
          subtitle="From frontline BPO to remote operations and automation — each role sharpened a distinct edge."
        />

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-border to-transparent hidden md:block" aria-hidden="true" />

          <div className="space-y-6">
            {EXPERIENCE.map((exp, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative md:pl-16"
              >
                {/* Timeline dot */}
                <div
                  className={`hidden md:flex absolute left-0 top-5 h-12 w-12 items-center justify-center rounded-full border-2 ${
                    exp.color === "primary"
                      ? "border-primary bg-primary/10"
                      : exp.color === "gold"
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10"
                      : "border-border bg-card"
                  }`}
                >
                  <Briefcase className={`h-5 w-5 ${
                    exp.color === "primary" ? "text-primary" :
                    exp.color === "gold" ? "text-gold" : "text-muted-foreground"
                  }`} />
                </div>

                <div className={`card-surface p-6 ${exp.color === "primary" ? "border-primary/30" : exp.color === "gold" ? "border-[var(--color-gold)]/30" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-foreground">{exp.role}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{exp.company} · {exp.location}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{exp.period}</span>
                      {exp.type === "Current" && (
                        <span className="badge-active text-xs px-2 py-0.5 rounded-full font-mono">Current</span>
                      )}
                      {exp.type === "Progression" && (
                        <span className="tag-gold text-xs px-2 py-0.5 rounded-full font-mono">Progression</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-6 mb-4">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((tag) => (
                      <span key={tag} className={`tag ${exp.color === "gold" ? "tag-gold" : ""}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PROJECTS ───────────────────────────────────────────────────────── */}
      <Section id="projects" className="bg-background">
        <SectionHeader
          eyebrow="03 — Featured Projects"
          title={<>Work that speaks <span className="gradient-text">for itself.</span></>}
          subtitle="Real systems, real results — built across property tech, BPO operations, and digital platforms."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, i) => (
            <motion.article
              key={project.repo}
              variants={fadeUp}
              className="card-surface p-6 flex flex-col group hover:border-primary/40 transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{project.icon}</span>
                  <div>
                    <span className="eyebrow text-[0.65rem]">{project.category}</span>
                    <h3 className="font-display font-semibold text-foreground">{project.name}</h3>
                  </div>
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={`View ${project.name} on GitHub`}
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>

              <p className="text-sm text-muted-foreground leading-6 flex-1 mb-4">{project.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag text-[0.65rem]">{tag}</span>
                ))}
              </div>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors mt-auto"
              >
                <Github className="h-3.5 w-3.5" />
                View on GitHub
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* ── AUTOMATIONS ────────────────────────────────────────────────────── */}
      <Section id="automations" className="bg-card/30">
        <SectionHeader
          eyebrow="04 — Make.com Automations"
          title={<>Automations built <span className="gradient-text">at 24fingers.</span></>}
          subtitle="15 production scenarios integrating CRM, email, calendar, AI, and webhook systems — all built and maintained as Automation Specialist."
        />

        {/* Summary stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { value: "15", label: "Total Scenarios" },
            { value: "11", label: "Active" },
            { value: "4", label: "Paused" },
            { value: "2,500+", label: "Total Executions" },
          ].map((s) => (
            <div key={s.label} className="card-surface p-4 text-center">
              <p className="text-2xl font-display font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AUTOMATIONS.map((auto) => (
            <motion.article
              key={auto.id}
              variants={fadeUp}
              className={`card-surface p-5 flex flex-col ${
                !auto.isActive ? "opacity-80" : ""
              } ${auto.isComplex ? "border-purple-500/30" : ""}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{auto.icon}</span>
                  <div>
                    <span className="eyebrow text-[0.6rem]">{auto.category}</span>
                    <h3 className="text-sm font-display font-semibold text-foreground leading-tight">{auto.name}</h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {auto.isActive ? (
                    <span className="badge-active inline-flex items-center gap-1 text-[0.65rem] px-2 py-0.5 rounded-full font-mono">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  ) : auto.isComplex ? (
                    <span className="badge-complex inline-flex items-center gap-1 text-[0.65rem] px-2 py-0.5 rounded-full font-mono">
                      <PauseCircle className="h-3 w-3" /> Paused · Complex
                    </span>
                  ) : (
                    <span className="badge-paused inline-flex items-center gap-1 text-[0.65rem] px-2 py-0.5 rounded-full font-mono">
                      <PauseCircle className="h-3 w-3" /> Paused
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-5 flex-1 mb-3">{auto.description}</p>

              {/* Tools */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {auto.tools.map((tool) => (
                  <span key={tool} className="tag text-[0.6rem]">{tool}</span>
                ))}
              </div>

              {/* Execution count */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-3 mt-auto">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono">{auto.executions.toLocaleString()} executions</span>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* ── SKILLS ─────────────────────────────────────────────────────────── */}
      <Section id="skills" className="bg-background">
        <SectionHeader
          eyebrow="05 — Capabilities"
          title={<>Skills forged in <span className="gradient-text">real operations.</span></>}
          subtitle="Not just tools — systems thinking, people leadership, and delivery discipline."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKILLS.map((skill, i) => (
            <motion.div key={skill.title} variants={fadeUp} className="card-surface p-6 hover:border-primary/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <skill.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground">{skill.title}</h3>
              </div>
              <ul className="space-y-2">
                {skill.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Tools ticker */}
        <motion.div variants={fadeUp} className="mt-12 overflow-hidden">
          <p className="eyebrow mb-4 text-center">Tools & Platforms</p>
          <div className="relative flex overflow-hidden">
            <div className="flex animate-[ticker_30s_linear_infinite] gap-3 whitespace-nowrap">
              {[...TOOLS_TICKER, ...TOOLS_TICKER].map((tool, i) => (
                <span key={i} className="tag-muted tag shrink-0">{tool}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── SERVICES ───────────────────────────────────────────────────────── */}
      <Section id="services" className="bg-card/30">
        <SectionHeader
          eyebrow="06 — What I Offer"
          title={<>Services tailored <span className="gradient-text">for your growth.</span></>}
          subtitle="Whether you need an operations partner, a project lead, or a capable VA — here's how I deliver value."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <motion.article
              key={service.number}
              variants={fadeUp}
              className="card-surface p-7 flex flex-col hover:border-primary/40 transition-colors duration-300 group"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6" />
                </div>
                <span className="font-mono text-3xl font-bold text-border">{service.number}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-3">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-6 flex-1 mb-5">{service.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {service.tags.map((tag) => (
                  <span key={tag} className="tag text-[0.65rem]">{tag}</span>
                ))}
              </div>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollTo("#contact"); }}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors mt-auto"
              >
                Enquire <ArrowUpRight className="h-4 w-4" />
              </a>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* ── CONTACT ────────────────────────────────────────────────────────── */}
      <Section id="contact" className="bg-background">
        <SectionHeader
          eyebrow="07 — Get In Touch"
          title={<>Ready to build <span className="gradient-text">something great?</span></>}
          subtitle="Open to remote roles, freelance projects, and long-term VA partnerships. Reach out — let's talk."
        />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact links */}
          <motion.div variants={fadeUp} className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "markravencanete50@gmail.com", href: "mailto:markravencanete50@gmail.com" },
              { icon: MessageCircle, label: "WhatsApp", value: "+63 997 482 6368", href: "https://wa.me/639974826368" },
              { icon: Linkedin, label: "LinkedIn", value: "linkedin.com/in/markravecan", href: "https://linkedin.com/in/markravecan" },
              { icon: Globe, label: "Upwork", value: "Hire me on Upwork", href: "https://www.upwork.com" },
              { icon: Star, label: "OnlineJobs.ph", value: "Find me on OnlineJobs.ph", href: "https://www.onlinejobs.ph" },
            ].map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 card-surface rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                  <contact.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{contact.label}</p>
                  <p className="text-sm text-foreground font-medium truncate">{contact.value}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto shrink-0 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </motion.div>

          {/* Contact form */}
          <motion.div variants={fadeUp}>
            <form onSubmit={handleContactSubmit} className="card-surface p-6 space-y-4">
              <h3 className="font-display font-semibold text-foreground mb-2">Send a Message</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-muted-foreground">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-muted-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs text-muted-foreground">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What's this about?"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((f) => ({ ...f, subject: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service" className="text-xs text-muted-foreground">Service of Interest</Label>
                <select
                  id="service"
                  value={contactForm.service}
                  onChange={(e) => setContactForm((f) => ({ ...f, service: e.target.value }))}
                  className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a service...</option>
                  <option value="operations">Operations Management</option>
                  <option value="va">Virtual Assistance & Admin</option>
                  <option value="recruitment">Recruitment Coordination</option>
                  <option value="automation">Automation (Make.com)</option>
                  <option value="website">Website Creation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs text-muted-foreground">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your project or role..."
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                  required
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/60 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={formSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {formSubmitting ? (
                  <>Sending...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Send Message</>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </Section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-display font-semibold text-foreground">
            MR<span className="text-primary">.</span>Cañete
          </p>
          <p>© 2026 Mark Raven Orica Cañete · Bohol, Philippines</p>
          <div className="flex items-center gap-4">
            <a href="https://linkedin.com/in/markravecan" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="https://github.com/markravencanete50-source" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="mailto:markravencanete50@gmail.com" className="hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
