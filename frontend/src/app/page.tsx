"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Code, Layers, Briefcase, Mail,
  Menu, X, ExternalLink, ArrowRight, CheckCircle, FileText, Settings, Database
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import * as api from "@/lib/api";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const DEFAULT_BIO = {
  name: "Developer Mandell",
  title: "Senior Backend Engineer & Systems Architect",
  about_me: "Dedicated to crafting robust API designs, high-throughput systems, and clean architectural patterns. Deeply specialized in Python, asyncio, relational databases, caching, and task queues.",
  email: "admin@mandell.tech",
  resume_url: null,
  github_url: "https://github.com",
  linkedin_url: "https://linkedin.com",
  twitter_url: "https://twitter.com",
  avatar_url: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=300&h=300&fit=crop"
};

const DEFAULT_EXPERIENCES = [
  {
    id: 1,
    company: "Kodehauz",
    role: "Software Engineering Intern",
    start_date: "Jan 2026",
    end_date: "Present",
    description: "Engineered backend application APIs using FastAPI, PostgreSQL, and Celery worker routines. Standardized domain entities and implemented dependency inversion to transition legacy systems to strict Clean Architecture. Enhanced system security with secure JWT flows and managed multi-container scaling via Docker Compose."
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "be-wordwiz",
    description: "An advanced dictionary parsing and word game analytics backend. Features scalable REST APIs, dynamic indexing, dictionary caching via Redis, and high-performance asynchronous background parsing jobs executed by Celery workers.",
    tech_tags: ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery", "Docker"],
    repo_link: "https://github.com/mandell-tech/be-wordwiz",
    live_link: "https://wordwiz.mandell.tech"
  }
];

// Stable icon name slug mappings for Simple Icons CDN
const SIMPLE_ICON_SLUGS: Record<string, string> = {
  nextjs: "nextdotjs",
  "react/next.js": "nextdotjs",
};

function getSimpleSlug(iconName: string): string {
  return SIMPLE_ICON_SLUGS[iconName.toLowerCase()] ?? iconName.toLowerCase();
}

type Tech = {
  id?: number;
  name: string;
  category: string;
  proficiency?: number;
  icon_name?: string;
};

// Stable top-level component — defined outside Home so React never remounts it
function TechIcon({ iconName, name, category }: { iconName?: string; name: string; category: string }) {
  type Stage = "devicon-orig" | "devicon-plain" | "simple" | "fallback";
  const [stage, setStage] = useState<Stage>(iconName ? "devicon-orig" : "fallback");

  const FallbackIcon = () => (
    <span className="text-text-muted group-hover:text-cyber-green transition-colors">
      {category === "Backend" && <Code className="w-6 h-6" />}
      {category === "Database" && <Database className="w-6 h-6" />}
      {category === "DevOps" && <Settings className="w-6 h-6" />}
      {!["Backend", "Database", "DevOps"].includes(category) && <Layers className="w-6 h-6" />}
    </span>
  );

  if (stage === "fallback" || !iconName) return <FallbackIcon />;

  const simpleSlug = getSimpleSlug(iconName);
  const srcs: Record<Stage, string> = {
    "devicon-orig": `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName}/${iconName}-original.svg`,
    "devicon-plain": `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName}/${iconName}-plain.svg`,
    "simple": `https://cdn.simpleicons.org/${simpleSlug}/10b981`,
    "fallback": "",
  };
  const nextStage: Record<Stage, Stage> = {
    "devicon-orig": "devicon-plain",
    "devicon-plain": "simple",
    "simple": "fallback",
    "fallback": "fallback",
  };

  return (
    <img
      src={srcs[stage]}
      alt={name}
      className="w-8 h-8 object-contain"
      onError={() => setStage(nextStage[stage])}
    />
  );
}

const DEFAULT_TECHS: Tech[] = [
  { name: "Python", category: "Backend", proficiency: 95, icon_name: "python" },
  { name: "FastAPI", category: "Backend", proficiency: 90, icon_name: "fastapi" },
  { name: "PostgreSQL", category: "Database", proficiency: 85, icon_name: "postgresql" },
  { name: "Redis", category: "Database", proficiency: 80, icon_name: "redis" },
  { name: "Docker", category: "DevOps", proficiency: 85, icon_name: "docker" },
  { name: "React / Next.js", category: "Frontend", proficiency: 70, icon_name: "nextjs" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "architecture" | "logs">("profile");

  const [bio, setBio] = useState(DEFAULT_BIO);
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [techs, setTechs] = useState<Tech[]>(DEFAULT_TECHS);
  const [isLoading, setIsLoading] = useState(true);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const bioData = await api.getProfile();
        setBio(bioData);
      } catch (err) { console.log("Using fallback bio details", err); }

      try {
        const expData = await api.getExperiences();
        if (expData.length > 0) setExperiences(expData);
      } catch (err) { console.log("Using fallback experiences", err); }

      try {
        const projData = await api.getProjects();
        if (projData.length > 0) setProjects(projData);
      } catch (err) { console.log("Using fallback projects", err); }

      try {
        const techData = await api.getTechnologies();
        if (techData.length > 0) setTechs(techData);
      } catch (err) { console.log("Using fallback technologies", err); }

      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-cyber-green relative overflow-hidden select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        
        {/* Animated Cyber-circles */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-cyber-green/5 animate-pulse" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-cyber-green/[0.02] animate-spin [animation-duration:60s]" />

        <div className="relative space-y-6 text-center z-10 max-w-sm px-6">
          <div className="flex items-center justify-center space-x-3 text-sm tracking-widest font-bold">
            <Terminal className="w-5 h-5 animate-pulse text-cyber-green" />
            <span className="animate-pulse">INITIALISING_SYSTEM...</span>
          </div>

          <div className="w-64 h-1.5 bg-slate-900 border border-card-border/50 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="h-full bg-primary-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" 
            />
          </div>

          <div className="text-[10px] text-text-muted flex flex-col space-y-1">
            <span>connecting to database engine...</span>
            <span className="text-cyber-green/60">handshake_established: ok</span>
          </div>
        </div>
      </div>
    );
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      setFormStatus("error");
      setFormMessage("Please fill in all details before submitting.");
      return;
    }
    setFormStatus("loading");
    try {
      await api.submitContactForm(contactName, contactEmail, contactMessage);
      setFormStatus("success");
      setFormMessage("Message submitted successfully! Notification processing asynchronously.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      setFormStatus("error");
      setFormMessage(err.message || "Failed to submit message.");
    }
  };

  return (
    <div className="min-h-screen grid-bg relative">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono font-bold text-lg text-primary-500">
            <Terminal className="w-5 h-5" />
            <span>mandell.tech</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 font-mono text-sm">
            <a href="#about" className="hover:text-primary-500 transition-colors">./about</a>
            <a href="#experience" className="hover:text-primary-500 transition-colors">./experience</a>
            <a href="#skills" className="hover:text-primary-500 transition-colors">./skills</a>
            <a href="#projects" className="hover:text-primary-500 transition-colors">./projects</a>
            <a href="#contact" className="hover:text-primary-500 transition-colors">./contact</a>
            <ThemeToggle />
          </nav>

          {/* Mobile Nav Trigger */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-card-border hover:bg-card-bg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-background border-b border-card-border p-6 font-mono text-center flex flex-col space-y-4"
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary-500 transition-colors">./about</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary-500 transition-colors">./experience</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary-500 transition-colors">./skills</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary-500 transition-colors">./projects</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary-500 transition-colors">./contact</a>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-28">

        {/* HERO SECTION / terminal editor */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 text-xs font-mono bg-primary-500/10 text-primary-500 rounded-full border border-primary-500/20">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
              <span>Available for backend opportunities</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans">
              Hi, I&apos;m <span className="text-primary-500">{bio.name}</span>
            </h1>

            <h2 className="text-xl sm:text-2xl font-mono text-text-muted font-medium">
              {bio.title}
            </h2>

            <p className="text-text-muted leading-relaxed font-sans">
              {bio.about_me}
            </p>

            <div className="flex flex-wrap gap-4 font-mono text-sm">
              <a
                href="#contact"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Form</span>
              </a>
              {bio.resume_url && (
                <a
                  href={bio.resume_url}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-card-bg border border-card-border hover:border-primary-500 transition-colors rounded-lg cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Resume</span>
                </a>
              )}
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <a href={bio.github_url} target="_blank" rel="noreferrer" className="text-text-muted hover:text-primary-500 transition-colors">
                <GithubIcon className="w-6 h-6" />
              </a>
              <a href={bio.linkedin_url} target="_blank" rel="noreferrer" className="text-text-muted hover:text-primary-500 transition-colors">
                <LinkedinIcon className="w-6 h-6" />
              </a>
              {bio.twitter_url && (
                <a href={bio.twitter_url} target="_blank" rel="noreferrer" className="text-text-muted hover:text-primary-500 transition-colors">
                  <TwitterIcon className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>

          {/* Terminal Panel */}
          <div className="lg:col-span-7">
            <div className="rounded-xl overflow-hidden border border-card-border shadow-2xl bg-terminal-bg font-mono text-sm">
              {/* Terminal Title Bar */}
              <div className="bg-card-bg border-b border-card-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-cyber-green/80 inline-block" />
                </div>
                <span className="text-xs text-text-muted">bash ~ mandell-ide</span>
                <span className="w-6" />
              </div>

              {/* Terminal Editor Tabs */}
              <div className="bg-card-bg/50 border-b border-card-border px-4 flex space-x-1 text-xs">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-2 cursor-pointer transition-colors border-b-2 font-medium ${activeTab === "profile"
                    ? "border-primary-500 text-foreground bg-terminal-bg/30"
                    : "border-transparent text-text-muted hover:text-foreground"
                    }`}
                >
                  profile.json
                </button>
                <button
                  onClick={() => setActiveTab("architecture")}
                  className={`px-3 py-2 cursor-pointer transition-colors border-b-2 font-medium ${activeTab === "architecture"
                    ? "border-primary-500 text-foreground bg-terminal-bg/30"
                    : "border-transparent text-text-muted hover:text-foreground"
                    }`}
                >
                  architecture.py
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`px-3 py-2 cursor-pointer transition-colors border-b-2 font-medium ${activeTab === "logs"
                    ? "border-primary-500 text-foreground bg-terminal-bg/30"
                    : "border-transparent text-text-muted hover:text-foreground"
                    }`}
                >
                  system_status.sh
                </button>
              </div>

              {/* Terminal View Content */}
              <div className="p-6 h-80 overflow-y-auto leading-relaxed text-terminal-text select-text bg-terminal-bg">
                {activeTab === "profile" && (
                  <pre className="text-cyber-green">
                    {`{
  "name": "${bio.name}",
  "role": "${bio.title}",
  "stack": {
    "languages": ["Python", "JavaScript", "SQL"],
    "frameworks": ["FastAPI", "Django", "Fastapi", "React", "Next.js"],
    "infrastructure": ["PostgreSQL", "Redis", "Celery", "Docker"]
  },
  "contact": {
    "email": "${bio.email}",
    "status": "accepting_payloads"
  }
}`}
                  </pre>
                )}

                {activeTab === "architecture" && (
                  <pre className="text-cyan-400">
                    {`class UseCase(IInteractor):
    def __init__(self, repo: IRepository, cache: ICache):
        self.repo = repo
        self.cache = cache
        
    async def execute(self, payload: Request) -> Response:
        # Business logic is decoupled from delivery frameworks
        cached_data = await self.cache.get(payload.key)
        if cached_data:
            return Response(data=cached_data)
            
        data = await self.repo.find(payload.id)
        await self.cache.set(payload.key, data, ttl=3600)
        return Response(data=data)
`}
                  </pre>
                )}

                {activeTab === "logs" && (
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span className="text-cyber-purple">[SYSTEM]</span>
                      <span>Initialising FastAPI Application...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-cyber-green">[DB]</span>
                      <span>Connected to PostgreSQL (asyncpg pool online)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-cyber-blue">[CACHE]</span>
                      <span>Redis cache initialized on port 6379</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-cyber-orange">[WORKER]</span>
                      <span>Celery process listener initialized (2 tasks loaded)</span>
                    </div>
                    <div className="text-cyber-green mt-4 font-bold animate-pulse">
                      $ curl -I http://localhost:8000/api/v1/profile
                      <br />
                      HTTP/1.1 200 OK (Connection: Keep-Alive)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* WORK EXPERIENCE / TIMELINE */}
        <section id="experience" className="space-y-10">
          <div className="border-l-4 border-primary-500 pl-4">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">Experience</h2>
            <p className="text-text-muted text-sm font-mono mt-1">./history/work_records</p>
          </div>

          <div className="relative border-l border-card-border ml-3 pl-8 space-y-12">
            {experiences.map((exp) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative space-y-3"
              >
                {/* Marker Dot */}
                <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-card-bg border border-card-border flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-xl font-bold tracking-tight">{exp.role}</h3>
                  <span className="text-xs font-mono px-3 py-1 bg-card-bg border border-card-border rounded-full text-text-muted self-start sm:self-auto">
                    {exp.start_date} - {exp.end_date || "Present"}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm font-mono text-primary-500">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-bold">{exp.company}</span>
                </div>

                <p className="text-text-muted leading-relaxed font-sans text-sm bg-card-bg/40 p-4 rounded-lg border border-card-border/50">
                  {exp.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SKILLS / TECH STACK GRID */}
        <section id="skills" className="space-y-10">
          <div className="border-l-4 border-cyber-green pl-4">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">Technology Stack</h2>
            <p className="text-text-muted text-sm font-mono mt-1">./dependencies/modules</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techs.map((tech) => (
              <motion.div
                key={tech.id ?? tech.name}
                whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.4)" }}
                className="bg-card-bg border border-card-border p-4 rounded-xl flex flex-col justify-between h-36 transition-all relative overflow-hidden group cursor-default"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Icon row */}
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <TechIcon iconName={tech.icon_name} name={tech.name} category={tech.category} />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-card-border/50 px-1.5 py-0.5 rounded text-text-muted leading-tight">
                    {tech.category}
                  </span>
                </div>

                {/* Name + proficiency */}
                <div className="space-y-1.5 relative z-10">
                  <h3 className="font-bold text-sm tracking-tight leading-tight">{tech.name}</h3>
                  {tech.proficiency && (
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[9px] font-mono text-text-muted">
                        <span>proficiency</span>
                        <span className="text-cyber-green font-bold">{tech.proficiency}%</span>
                      </div>
                      <div className="h-0.5 bg-card-border/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyber-green rounded-full"
                          style={{ width: `${tech.proficiency}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PROJECTS GALLERY */}
        <section id="projects" className="space-y-10">
          <div className="border-l-4 border-cyber-purple pl-4">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">Projects Showcase</h2>
            <p className="text-text-muted text-sm font-mono mt-1">./repositories/showcase</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((proj) => (
              <motion.div
                key={proj.id}
                whileHover={{ y: -8 }}
                className="bg-card-bg border border-card-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg h-full transition-all group hover:shadow-xl hover:border-cyber-purple/30"
              >
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-cyber-purple/10 text-cyber-purple">
                      <Code className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-3 text-text-muted">
                      {proj.repo_link && (
                        <a href={proj.repo_link} target="_blank" rel="noreferrer" className="hover:text-cyber-purple transition-colors">
                          <GithubIcon className="w-5 h-5" />
                        </a>
                      )}
                      {proj.live_link && (
                        <a href={proj.live_link} target="_blank" rel="noreferrer" className="hover:text-cyber-purple transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight group-hover:text-cyber-purple transition-colors">
                    {proj.title}
                  </h3>

                  <p className="text-text-muted leading-relaxed font-sans text-sm">
                    {proj.description}
                  </p>
                </div>

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-card-border bg-card-bg/20 flex flex-wrap gap-2">
                  {proj.tech_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2.5 py-1 bg-card-border/50 rounded-md text-text-muted border border-card-border/30 hover:text-cyber-purple transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CONTACT FORM SECTION */}
        <section id="contact" className="space-y-10">
          <div className="border-l-4 border-cyber-orange pl-4">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">Contact Terminal</h2>
            <p className="text-text-muted text-sm font-mono mt-1">./post/contact_form</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-xl font-bold tracking-tight">Let&apos;s build something high-performance.</h3>
              <p className="text-text-muted text-sm leading-relaxed font-sans">
                Submit a payload through this contact terminal. The FastAPI endpoint accepts input parameters securely and queues the dispatch worker using Celery immediately.
              </p>

              <div className="p-5 rounded-xl border border-card-border bg-card-bg font-mono text-xs space-y-3">
                <div className="flex items-center space-x-2 text-text-muted">
                  <ArrowRight className="w-4 h-4 text-cyber-orange" />
                  <span className="font-bold uppercase">Target Endpoint:</span>
                  <span className="text-cyber-orange">POST /api/v1/contact/</span>
                </div>
                <div className="flex items-center space-x-2 text-text-muted">
                  <ArrowRight className="w-4 h-4 text-cyber-orange" />
                  <span className="font-bold uppercase">Response Code:</span>
                  <span className="text-green-500">202 Accepted</span>
                </div>
                <div className="flex items-center space-x-2 text-text-muted">
                  <ArrowRight className="w-4 h-4 text-cyber-orange" />
                  <span className="font-bold uppercase">Queue broker:</span>
                  <span>Redis queue {"->"} Celery Worker</span>
                </div>
              </div>
            </div>

            {/* Form Panel */}
            <div className="lg:col-span-7 bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-sm">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-bold uppercase text-text-muted">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Developer Mandell"
                      className="w-full bg-background border border-card-border rounded-lg px-4 py-3 focus:outline-none focus:border-cyber-orange transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-bold uppercase text-text-muted">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. admin@mandell.tech"
                      className="w-full bg-background border border-card-border rounded-lg px-4 py-3 focus:outline-none focus:border-cyber-orange transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 font-mono text-sm">
                  <label htmlFor="message" className="block text-xs font-bold uppercase text-text-muted">Message payload</label>
                  <textarea
                    id="message"
                    rows={5}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Enter details..."
                    className="w-full bg-background border border-card-border rounded-lg px-4 py-3 focus:outline-none focus:border-cyber-orange transition-colors"
                    required
                  />
                </div>

                {formStatus !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg font-mono text-xs flex items-start space-x-2 ${formStatus === "success"
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : formStatus === "error"
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-primary-500/10 text-primary-500 border border-primary-500/20"
                      }`}
                  >
                    {formStatus === "success" && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                    <p>{formMessage || (formStatus === "loading" ? "Dispatching Celery worker process..." : "")}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full font-mono text-sm bg-cyber-orange hover:bg-amber-600 disabled:bg-card-border text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {formStatus === "loading" ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-card-border bg-card-bg/20 mt-20 font-mono text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Mandell Portfolio. Rest API via Clean Architecture.</p>
          <div className="flex items-center space-x-6">
            <a href="#about" className="hover:text-foreground">./top</a>
            <span className="text-card-border">|</span>
            <span className="text-cyber-green font-bold">Secure connection established</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
