"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Code, Layers, Briefcase, Mail,
  Menu, X, ExternalLink, ArrowRight, CheckCircle, FileText, Settings, Database
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Background3D from "@/components/Background3D";
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

// Stable top-level component
function TechIcon({ iconName, name, category }: { iconName?: string; name: string; category: string }) {
  const [error, setError] = useState(false);

  const fallbackIcon = (
    <span className="text-text-muted group-hover:text-cyber-green transition-colors">
      {category === "Backend" && <Code className="w-6 h-6" />}
      {category === "Database" && <Database className="w-6 h-6" />}
      {category === "DevOps" && <Settings className="w-6 h-6" />}
      {!["Backend", "Database", "DevOps"].includes(category) && <Layers className="w-6 h-6" />}
    </span>
  );

  if (error || !iconName) return fallbackIcon;

  const simpleSlug = getSimpleSlug(iconName);
  const src = `https://cdn.simpleicons.org/${simpleSlug}/10b981`;

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className="w-8 h-8 object-contain"
      onError={() => setError(true)}
    />
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "architecture" | "logs">("profile");

  const [bio, setBio] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [techs, setTechs] = useState<Tech[]>([]);
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
      } catch (err) { console.log("Failed to load bio", err); }

      try {
        const expData = await api.getExperiences();
        if (expData.length > 0) setExperiences(expData);
      } catch (err) { console.log("Failed to load experiences", err); }

      try {
        const projData = await api.getProjects();
        if (projData.length > 0) setProjects(projData);
      } catch (err) { console.log("Failed to load projects", err); }

      try {
        const techData = await api.getTechnologies();
        if (techData.length > 0) setTechs(techData);
      } catch (err) { console.log("Failed to load technologies", err); }

      setIsLoading(false);
    }
    loadData();
  }, []);

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
    <div className="min-h-screen relative overflow-hidden bg-background">
      <Background3D />
      
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-card-border shadow-sm">
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
              aria-label="Toggle mobile menu"
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
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-card-border p-6 font-mono text-center flex flex-col space-y-1 shadow-2xl"
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-3 rounded-lg hover:bg-card-bg hover:text-primary-500 transition-all font-semibold">./about</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="py-3 rounded-lg hover:bg-card-bg hover:text-primary-500 transition-all font-semibold">./experience</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-3 rounded-lg hover:bg-card-bg hover:text-primary-500 transition-all font-semibold">./skills</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="py-3 rounded-lg hover:bg-card-bg hover:text-primary-500 transition-all font-semibold">./projects</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-3 rounded-lg hover:bg-card-bg hover:text-primary-500 transition-all font-semibold">./contact</a>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-28 relative z-10">

        {/* HERO SECTION */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[60vh]">
          <div className="lg:col-span-5 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-3 py-1 text-xs font-mono bg-primary-500/10 text-primary-500 rounded-full border border-primary-500/20 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
              <span>Available for backend opportunities</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-sans">
              {bio ? (
                <>Hi, I&apos;m <span className="text-primary-500 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-cyber-orange">{bio.name}</span></>
              ) : (
                <div className="h-14 w-3/4 bg-card-border/40 animate-pulse rounded-lg" />
              )}
            </h1>

            <h2 className="text-xl sm:text-2xl font-mono text-text-muted font-medium">
              {bio ? bio.title : <div className="h-8 w-2/3 bg-card-border/30 animate-pulse rounded-lg mt-2" />}
            </h2>

            <div className="text-text-muted leading-relaxed font-sans text-lg">
              {bio ? bio.about_me : (
                <div className="space-y-3 mt-4">
                  <div className="h-4 w-full bg-card-border/20 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-card-border/20 animate-pulse rounded" />
                  <div className="h-4 w-4/6 bg-card-border/20 animate-pulse rounded" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 font-mono text-sm pt-4">
              <a
                href="#contact"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-transform hover:scale-105 cursor-pointer shadow-lg shadow-primary-500/30"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Form</span>
              </a>
              {bio?.resume_url && (
                <a
                  href={bio.resume_url}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-card-bg/50 backdrop-blur-md border border-card-border hover:border-primary-500 hover:bg-card-bg transition-all rounded-lg cursor-pointer shadow-lg"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Resume</span>
                </a>
              )}
            </div>

            <div className="flex items-center space-x-5 pt-4">
              {bio ? (
                <>
                  <a href={bio.github_url} target="_blank" rel="noreferrer" aria-label="GitHub Profile" className="text-text-muted hover:text-primary-500 transition-colors transform hover:scale-110">
                    <GithubIcon className="w-6 h-6" />
                  </a>
                  <a href={bio.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn Profile" className="text-text-muted hover:text-primary-500 transition-colors transform hover:scale-110">
                    <LinkedinIcon className="w-6 h-6" />
                  </a>
                  {bio.twitter_url && (
                    <a href={bio.twitter_url} target="_blank" rel="noreferrer" aria-label="Twitter Profile" className="text-text-muted hover:text-primary-500 transition-colors transform hover:scale-110">
                      <TwitterIcon className="w-6 h-6" />
                    </a>
                  )}
                </>
              ) : (
                <div className="flex space-x-4">
                  <div className="w-6 h-6 rounded-full bg-card-border/30 animate-pulse" />
                  <div className="w-6 h-6 rounded-full bg-card-border/30 animate-pulse" />
                  <div className="w-6 h-6 rounded-full bg-card-border/30 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Terminal Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="rounded-xl overflow-hidden border border-card-border shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] bg-terminal-bg/80 backdrop-blur-xl font-mono text-sm">
              <div className="bg-card-bg/80 border-b border-card-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                  <span className="w-3 h-3 rounded-full bg-cyber-green/80 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <span className="text-xs text-text-muted">bash ~ mandell-ide</span>
                <span className="w-6" />
              </div>

              <div className="bg-card-bg/40 border-b border-card-border px-4 flex space-x-1 text-xs">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-2 cursor-pointer transition-colors border-b-2 font-medium ${activeTab === "profile"
                    ? "border-primary-500 text-foreground bg-terminal-bg/50"
                    : "border-transparent text-text-muted hover:text-foreground"
                    }`}
                >
                  profile.json
                </button>
                <button
                  onClick={() => setActiveTab("architecture")}
                  className={`px-3 py-2 cursor-pointer transition-colors border-b-2 font-medium ${activeTab === "architecture"
                    ? "border-primary-500 text-foreground bg-terminal-bg/50"
                    : "border-transparent text-text-muted hover:text-foreground"
                    }`}
                >
                  architecture.py
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`px-3 py-2 cursor-pointer transition-colors border-b-2 font-medium ${activeTab === "logs"
                    ? "border-primary-500 text-foreground bg-terminal-bg/50"
                    : "border-transparent text-text-muted hover:text-foreground"
                    }`}
                >
                  system_status.sh
                </button>
              </div>

              <div className="p-6 h-80 overflow-y-auto leading-relaxed text-terminal-text select-text">
                {activeTab === "profile" && (
                  <pre className="text-cyber-green">
                    {bio ? `{
  "name": "${bio.name}",
  "role": "${bio.title}",
  "stack": {
    "languages": ["Python", "JavaScript", "SQL"],
    "frameworks": ["FastAPI", "Django", "React", "Next.js"],
    "infrastructure": ["PostgreSQL", "Redis", "Celery", "Docker"]
  },
  "contact": {
    "email": "${bio.email}",
    "status": "accepting_payloads"
  }
}` : `{\n  "status": "loading..."\n}`}
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
          </motion.div>
        </section>

        {/* WORK EXPERIENCE */}
        <section id="experience" className="space-y-10 pt-10">
          <div className="border-l-4 border-primary-500 pl-4">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">Experience</h2>
            <p className="text-text-muted text-sm font-mono mt-1">./history/work_records</p>
          </div>

          <div className="relative border-l border-card-border ml-3 pl-8 space-y-12">
            {isLoading ? (
              // Skeleton for experiences
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="relative space-y-4">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-card-bg border border-card-border flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-card-border/50 animate-pulse" />
                  </div>
                  <div className="h-6 w-48 bg-card-border/30 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-card-border/20 animate-pulse rounded" />
                  <div className="h-24 w-full bg-card-border/10 animate-pulse rounded-lg" />
                </div>
              ))
            ) : (
              experiences.map((exp) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                  className="relative space-y-3"
                >
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-card-bg/80 backdrop-blur-sm border border-card-border flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="text-xl font-bold tracking-tight">{exp.role}</h3>
                    <span className="text-xs font-mono px-3 py-1 bg-card-bg/50 backdrop-blur-sm border border-card-border rounded-full text-text-muted self-start sm:self-auto shadow-sm">
                      {exp.start_date} - {exp.end_date || "Present"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm font-mono text-primary-500">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-bold">{exp.company}</span>
                  </div>

                  <p className="text-text-muted leading-relaxed font-sans text-sm bg-card-bg/30 backdrop-blur-md p-5 rounded-xl border border-card-border/50 shadow-lg">
                    {exp.description}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="space-y-10 pt-10">
          <div className="border-l-4 border-cyber-green pl-4">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">Technology Stack</h2>
            <p className="text-text-muted text-sm font-mono mt-1">./dependencies/modules</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card-bg/20 border border-card-border/30 h-36 rounded-xl animate-pulse" />
              ))
            ) : (
              techs.map((tech) => (
                <motion.div
                  key={tech.id ?? tech.name}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card-bg/40 backdrop-blur-xl border border-card-border/60 hover:border-cyber-green/50 hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)] p-5 rounded-2xl flex flex-col justify-between h-40 transition-all relative overflow-hidden group cursor-default"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-10 h-10 flex items-center justify-center p-1 bg-background/50 rounded-lg border border-card-border/50 group-hover:border-cyber-green/30 transition-colors">
                      <TechIcon iconName={tech.icon_name} name={tech.name} category={tech.category} />
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-card-border/40 px-2 py-1 rounded text-text-muted leading-tight border border-card-border/20">
                      {tech.category}
                    </span>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="font-bold text-sm tracking-tight leading-tight">{tech.name}</h3>
                    {tech.proficiency && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-text-muted">
                          <span>lvl</span>
                          <span className="text-cyber-green font-bold">{tech.proficiency}%</span>
                        </div>
                        <div className="h-1 bg-background/80 rounded-full overflow-hidden border border-card-border/30">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${tech.proficiency}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-cyber-green/50 to-cyber-green rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="space-y-10 pt-10">
          <div className="border-l-4 border-cyber-purple pl-4">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans">Projects Showcase</h2>
            <p className="text-text-muted text-sm font-mono mt-1">./repositories/showcase</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-card-bg/20 border border-card-border/30 h-72 rounded-2xl animate-pulse" />
              ))
            ) : (
              projects.map((proj) => (
                <motion.div
                  key={proj.id}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card-bg/40 backdrop-blur-xl border border-card-border/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.1)] h-full transition-all group hover:shadow-[0_16px_48px_rgba(168,85,247,0.15)] hover:border-cyber-purple/40"
                >
                  <div className="p-8 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20">
                        <Code className="w-5 h-5" />
                      </div>
                      <div className="flex items-center space-x-4 text-text-muted">
                        {proj.repo_link && (
                          <a href={proj.repo_link} target="_blank" rel="noreferrer" aria-label="GitHub Repository" className="hover:text-cyber-purple transition-colors hover:scale-110 transform">
                            <GithubIcon className="w-5 h-5" />
                          </a>
                        )}
                        {proj.live_link && (
                          <a href={proj.live_link} target="_blank" rel="noreferrer" aria-label="Live Project" className="hover:text-cyber-purple transition-colors hover:scale-110 transform">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight group-hover:text-cyber-purple transition-colors">
                      {proj.title}
                    </h3>

                    <p className="text-text-muted leading-relaxed font-sans text-sm">
                      {proj.description}
                    </p>
                  </div>

                  <div className="px-8 pb-8 pt-5 border-t border-card-border/50 bg-card-bg/30 flex flex-wrap gap-2">
                    {proj.tech_tags?.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-3 py-1.5 bg-background/50 rounded-md text-text-muted border border-card-border/30 hover:text-cyber-purple hover:border-cyber-purple/30 transition-colors shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* CONTACT FORM */}
        <section id="contact" className="space-y-10 pt-10 pb-10">
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

              <div className="p-6 rounded-2xl border border-card-border/60 bg-card-bg/40 backdrop-blur-md font-mono text-xs space-y-4 shadow-lg">
                <div className="flex items-center space-x-3 text-text-muted">
                  <ArrowRight className="w-4 h-4 text-cyber-orange" />
                  <span className="font-bold uppercase">Target Endpoint:</span>
                  <span className="text-cyber-orange bg-cyber-orange/10 px-2 py-1 rounded">POST /api/v1/contact/</span>
                </div>
                <div className="flex items-center space-x-3 text-text-muted">
                  <ArrowRight className="w-4 h-4 text-cyber-orange" />
                  <span className="font-bold uppercase">Response Code:</span>
                  <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded">202 Accepted</span>
                </div>
                <div className="flex items-center space-x-3 text-text-muted">
                  <ArrowRight className="w-4 h-4 text-cyber-orange" />
                  <span className="font-bold uppercase">Queue broker:</span>
                  <span className="text-text-muted bg-background/50 px-2 py-1 rounded">Redis {"->"} Celery</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-card-bg/50 backdrop-blur-xl border border-card-border/60 rounded-3xl p-8 shadow-[0_16px_48px_rgba(0,0,0,0.2)]">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-sm">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-bold uppercase text-text-muted ml-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Developer Mandell"
                      className="w-full bg-background/80 backdrop-blur-sm border border-card-border/60 rounded-xl px-5 py-4 focus:outline-none focus:border-cyber-orange focus:ring-1 focus:ring-cyber-orange/50 transition-all shadow-inner"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-bold uppercase text-text-muted ml-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. admin@mandell.tech"
                      className="w-full bg-background/80 backdrop-blur-sm border border-card-border/60 rounded-xl px-5 py-4 focus:outline-none focus:border-cyber-orange focus:ring-1 focus:ring-cyber-orange/50 transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 font-mono text-sm">
                  <label htmlFor="message" className="block text-xs font-bold uppercase text-text-muted ml-1">Message payload</label>
                  <textarea
                    id="message"
                    rows={5}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Enter details..."
                    className="w-full bg-background/80 backdrop-blur-sm border border-card-border/60 rounded-xl px-5 py-4 focus:outline-none focus:border-cyber-orange focus:ring-1 focus:ring-cyber-orange/50 transition-all shadow-inner resize-none"
                    required
                  />
                </div>

                {formStatus !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl font-mono text-xs flex items-start space-x-3 shadow-md ${formStatus === "success"
                      ? "bg-green-500/10 text-green-500 border border-green-500/30"
                      : formStatus === "error"
                        ? "bg-red-500/10 text-red-500 border border-red-500/30"
                        : "bg-primary-500/10 text-primary-500 border border-primary-500/30"
                      }`}
                  >
                    {formStatus === "success" && <CheckCircle className="w-5 h-5 mt-0 shrink-0" />}
                    <p className="text-sm mt-0.5">{formMessage || (formStatus === "loading" ? "Dispatching Celery worker process..." : "")}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full font-sans text-base bg-cyber-orange hover:bg-amber-500 disabled:bg-card-border/50 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] disabled:shadow-none"
                >
                  {formStatus === "loading" ? (
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-card-border/30 bg-card-bg/10 backdrop-blur-sm mt-20 font-mono text-xs text-text-muted relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Mandell Portfolio. Rest API via Clean Architecture.</p>
          <div className="flex items-center space-x-6">
            <a href="#about" className="hover:text-primary-500 transition-colors">./top</a>
            <span className="text-card-border/50">|</span>
            <span className="text-cyber-green/80 font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span>Secure connection established</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
