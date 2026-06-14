"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal, LogOut, User, Briefcase, Code, Settings, Plus, Trash2, Edit2,
  Check, X, ShieldAlert, ShieldCheck, Database, Layers, ArrowLeft
} from "lucide-react";
import * as api from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminDashboard() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"bio" | "experiences" | "projects" | "technologies">("bio");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [bioName, setBioName] = useState("");
  const [bioTitle, setBioTitle] = useState("");
  const [bioAbout, setBioAbout] = useState("");
  const [bioEmail, setBioEmail] = useState("");
  const [bioResume, setBioResume] = useState("");
  const [bioGithub, setBioGithub] = useState("");
  const [bioLinkedin, setBioLinkedin] = useState("");
  const [bioTwitter, setBioTwitter] = useState("");
  const [bioAvatar, setBioAvatar] = useState("");
  const [bioId, setBioId] = useState<number | null>(null);

  const [experiences, setExperiences] = useState<any[]>([]);
  const [expId, setExpId] = useState<number | null>(null);
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expOrder, setExpOrder] = useState(0);
  const [expModalOpen, setExpModalOpen] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [projId, setProjId] = useState<number | null>(null);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projTags, setProjTags] = useState("");
  const [projRepo, setProjRepo] = useState("");
  const [projLive, setProjLive] = useState("");
  const [projOrder, setProjOrder] = useState(0);
  const [projModalOpen, setProjModalOpen] = useState(false);

  const [techs, setTechs] = useState<any[]>([]);
  const [techId, setTechId] = useState<number | null>(null);
  const [techName, setTechName] = useState("");
  const [techCategory, setTechCategory] = useState("Backend");
  const [techProficiency, setTechProficiency] = useState(80);
  const [techIcon, setTechIcon] = useState("");
  const [techOrder, setTechOrder] = useState(0);
  const [techModalOpen, setTechModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);
    setAdminEmail(localStorage.getItem("admin_email") || "admin@mandell.tech");

    loadBioData();
    loadExperiencesData();
    loadProjectsData();
    loadTechnologiesData();
  }, [router]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const loadBioData = async () => {
    try {
      const data = await api.getProfile();
      setBioId(data.id);
      setBioName(data.name || "");
      setBioTitle(data.title || "");
      setBioAbout(data.about_me || "");
      setBioEmail(data.email || "");
      setBioResume(data.resume_url || "");
      setBioGithub(data.github_url || "");
      setBioLinkedin(data.linkedin_url || "");
      setBioTwitter(data.twitter_url || "");
      setBioAvatar(data.avatar_url || "");
    } catch (err) {
      console.log("No profile in DB yet.");
    }
  };

  const handleUpdateBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await api.updateProfileCMS({
        name: bioName,
        title: bioTitle,
        about_me: bioAbout,
        email: bioEmail,
        resume_url: bioResume || null,
        github_url: bioGithub || null,
        linkedin_url: bioLinkedin || null,
        twitter_url: bioTwitter || null,
        avatar_url: bioAvatar || null
      });
      showSuccess("Bio information updated successfully!");
    } catch (err: any) {
      showError(err.message || "Failed to update profile.");
    }
  };

  const loadExperiencesData = async () => {
    try {
      const data = await api.getExperiences();
      setExperiences(data);
    } catch (err) { console.error(err); }
  };

  const openAddExp = () => {
    setExpId(null);
    setExpCompany("");
    setExpRole("");
    setExpStart("");
    setExpEnd("");
    setExpDesc("");
    setExpOrder(0);
    setExpModalOpen(true);
  };

  const openEditExp = (exp: any) => {
    setExpId(exp.id);
    setExpCompany(exp.company);
    setExpRole(exp.role);
    setExpStart(exp.start_date);
    setExpEnd(exp.end_date || "");
    setExpDesc(exp.description);
    setExpOrder(exp.order_index);
    setExpModalOpen(true);
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        company: expCompany,
        role: expRole,
        start_date: expStart,
        end_date: expEnd || null,
        description: expDesc,
        order_index: expOrder
      };
      if (expId) {
        await api.updateExperienceCMS(expId, payload);
        showSuccess("Experience updated!");
      } else {
        await api.createExperienceCMS(payload);
        showSuccess("Experience created!");
      }
      setExpModalOpen(false);
      loadExperiencesData();
    } catch (err: any) {
      showError(err.message || "Failed to save experience.");
    }
  };

  const handleDeleteExp = async (id: number) => {
    if (!confirm("Are you sure you want to delete this experience record?")) return;
    try {
      await api.deleteExperienceCMS(id);
      showSuccess("Experience deleted!");
      loadExperiencesData();
    } catch (err: any) {
      showError(err.message || "Failed to delete experience.");
    }
  };

  const loadProjectsData = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) { console.error(err); }
  };

  const openAddProj = () => {
    setProjId(null);
    setProjTitle("");
    setProjDesc("");
    setProjTags("");
    setProjRepo("");
    setProjLive("");
    setProjOrder(0);
    setProjModalOpen(true);
  };

  const openEditProj = (proj: any) => {
    setProjId(proj.id);
    setProjTitle(proj.title);
    setProjDesc(proj.description);
    setProjTags(proj.tech_tags.join(", "));
    setProjRepo(proj.repo_link || "");
    setProjLive(proj.live_link || "");
    setProjOrder(proj.order_index);
    setProjModalOpen(true);
  };

  const handleSaveProj = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsList = projTags.split(",").map(t => t.trim()).filter(Boolean);
      const payload = {
        title: projTitle,
        description: projDesc,
        tech_tags: tagsList,
        repo_link: projRepo || null,
        live_link: projLive || null,
        order_index: projOrder
      };
      if (projId) {
        await api.updateProjectCMS(projId, payload);
        showSuccess("Project updated!");
      } else {
        await api.createProjectCMS(payload);
        showSuccess("Project created!");
      }
      setProjModalOpen(false);
      loadProjectsData();
    } catch (err: any) {
      showError(err.message || "Failed to save project.");
    }
  };

  const handleDeleteProj = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project record?")) return;
    try {
      await api.deleteProjectCMS(id);
      showSuccess("Project deleted!");
      loadProjectsData();
    } catch (err: any) {
      showError(err.message || "Failed to delete project.");
    }
  };

  const loadTechnologiesData = async () => {
    try {
      const data = await api.getTechnologies();
      setTechs(data);
    } catch (err) { console.error(err); }
  };

  const openAddTech = () => {
    setTechId(null);
    setTechName("");
    setTechCategory("Backend");
    setTechProficiency(80);
    setTechIcon("");
    setTechOrder(0);
    setTechModalOpen(true);
  };

  const openEditTech = (tech: any) => {
    setTechId(tech.id);
    setTechName(tech.name);
    setTechCategory(tech.category);
    setTechProficiency(tech.proficiency || 80);
    setTechIcon(tech.icon_name || "");
    setTechOrder(tech.order_index);
    setTechModalOpen(true);
  };

  const handleSaveTech = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: techName,
        category: techCategory,
        proficiency: techProficiency,
        icon_name: techIcon || null,
        order_index: techOrder
      };
      if (techId) {
        await api.updateTechnologyCMS(techId, payload);
        showSuccess("Technology updated!");
      } else {
        await api.createTechnologyCMS(payload);
        showSuccess("Technology created!");
      }
      setTechModalOpen(false);
      loadTechnologiesData();
    } catch (err: any) {
      showError(err.message || "Failed to save technology.");
    }
  };

  const handleDeleteTech = async (id: number) => {
    if (!confirm("Are you sure you want to delete this technology record?")) return;
    try {
      await api.deleteTechnologyCMS(id);
      showSuccess("Technology deleted!");
      loadTechnologiesData();
    } catch (err: any) {
      showError(err.message || "Failed to delete technology.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_email");
    router.replace("/admin/login");
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-sm">Authorizing CMS credentials...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">

      {/* Top CMS Header */}
      <header className="bg-card-bg border-b border-card-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-mono text-primary-500 font-bold">
            <Terminal className="w-5 h-5" />
            <span>mandell.tech/admin/dashboard</span>
          </div>
          <span className="text-xs font-mono bg-card-border/50 text-text-muted px-2.5 py-0.5 rounded">CMS Utility</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-text-muted hover:text-foreground font-mono transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Site</span>
          </Link>
          <ThemeToggle />
          <div className="h-6 w-[1px] bg-card-border" />
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-text-muted select-none">User:</span>
            <span className="font-bold">{adminEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main CMS Split Panel */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-6 gap-6">

        {/* Sidebar Nav (Util layout) */}
        <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <h2 className="text-xs font-bold font-mono text-text-muted uppercase px-3 mb-2 tracking-wider">CMS Collections</h2>
          <button
            onClick={() => setActiveTab("bio")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 cursor-pointer ${activeTab === "bio"
                ? "bg-primary-500 text-white"
                : "bg-card-bg border border-card-border hover:bg-card-border/30"
              }`}
          >
            <User className="w-4 h-4" />
            <span>User Profile & Bio</span>
          </button>
          <button
            onClick={() => setActiveTab("experiences")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 cursor-pointer ${activeTab === "experiences"
                ? "bg-primary-500 text-white"
                : "bg-card-bg border border-card-border hover:bg-card-border/30"
              }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Experience Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 cursor-pointer ${activeTab === "projects"
                ? "bg-primary-500 text-white"
                : "bg-card-bg border border-card-border hover:bg-card-border/30"
              }`}
          >
            <Code className="w-4 h-4" />
            <span>Projects Showcase</span>
          </button>
          <button
            onClick={() => setActiveTab("technologies")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 cursor-pointer ${activeTab === "technologies"
                ? "bg-primary-500 text-white"
                : "bg-card-bg border border-card-border hover:bg-card-border/30"
              }`}
          >
            <Database className="w-4 h-4" />
            <span>Technologies Stack</span>
          </button>

          {/* Quick CMS Diagnostics */}
          <div className="mt-8 p-4 rounded-lg bg-card-bg border border-card-border font-mono text-[10px] text-text-muted space-y-2 select-text">
            <p className="font-bold text-xs uppercase tracking-wider text-foreground mb-1 select-none">API Diagnostics</p>
            <div className="flex justify-between"><span>Status:</span><span className="text-green-500">CONNECTED</span></div>
            <div className="flex justify-between"><span>Engine:</span><span>FASTAPI + SQLA</span></div>
            <div className="flex justify-between"><span>Cache:</span><span>REDIS ACTIVE</span></div>
            <div className="flex justify-between"><span>Tasks:</span><span>CELERY ALIVE</span></div>
          </div>
        </aside>

        {/* CMS Tab workspace */}
        <main className="flex-1 bg-card-bg border border-card-border rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between overflow-y-auto">

          {/* Notifications banner */}
          {(successMsg || errorMsg) && (
            <div className="mb-6 space-y-2">
              {successMsg && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-mono flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* 1. BIO TAB */}
          {activeTab === "bio" && (
            <div className="space-y-6">
              <div className="border-b border-card-border pb-4">
                <h3 className="text-lg font-bold tracking-tight">Admin Profile & Bio settings</h3>
                <p className="text-xs text-text-muted font-mono">performs: PUT /api/v1/profile</p>
              </div>

              <form onSubmit={handleUpdateBio} className="space-y-4 text-sm font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Display Name</label>
                    <input
                      type="text"
                      value={bioName}
                      onChange={(e) => setBioName(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Professional Title</label>
                    <input
                      type="text"
                      value={bioTitle}
                      onChange={(e) => setBioTitle(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-text-muted">About Me Narrative</label>
                  <textarea
                    rows={4}
                    value={bioAbout}
                    onChange={(e) => setBioAbout(e.target.value)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans text-sm leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Email address</label>
                    <input
                      type="email"
                      value={bioEmail}
                      onChange={(e) => setBioEmail(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Avatar URL</label>
                    <input
                      type="text"
                      value={bioAvatar}
                      onChange={(e) => setBioAvatar(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Resume link</label>
                    <input
                      type="text"
                      value={bioResume}
                      onChange={(e) => setBioResume(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">GitHub profile URL</label>
                    <input
                      type="text"
                      value={bioGithub}
                      onChange={(e) => setBioGithub(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">LinkedIn URL</label>
                    <input
                      type="text"
                      value={bioLinkedin}
                      onChange={(e) => setBioLinkedin(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Twitter/X URL</label>
                    <input
                      type="text"
                      value={bioTwitter}
                      onChange={(e) => setBioTwitter(e.target.value)}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded font-bold cursor-pointer transition-colors"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>
          )}

          {/* 2. EXPERIENCES TAB */}
          {activeTab === "experiences" && (
            <div className="space-y-6">
              <div className="border-b border-card-border pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Manage Experience Records</h3>
                  <p className="text-xs text-text-muted font-mono">performs: POST/PUT/DELETE /api/v1/experiences</p>
                </div>
                <button
                  onClick={openAddExp}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {/* Experiences Table */}
              <div className="overflow-x-auto border border-card-border rounded-lg">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-card-bg/80 border-b border-card-border text-xs uppercase font-bold text-text-muted">
                      <th className="p-4">Company</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Order</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-text-muted font-mono text-xs">no_records_found</td>
                      </tr>
                    ) : (
                      experiences.map((exp) => (
                        <tr key={exp.id} className="border-b border-card-border hover:bg-card-bg/25 transition-colors">
                          <td className="p-4 font-bold">{exp.company}</td>
                          <td className="p-4">{exp.role}</td>
                          <td className="p-4 text-xs font-mono">{exp.start_date} - {exp.end_date || "Present"}</td>
                          <td className="p-4 font-mono text-xs">{exp.order_index}</td>
                          <td className="p-4 text-right flex justify-end space-x-2">
                            <button
                              onClick={() => openEditExp(exp)}
                              className="p-1.5 rounded border border-card-border hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExp(exp.id)}
                              className="p-1.5 rounded border border-card-border hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="border-b border-card-border pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Manage Projects Showcase</h3>
                  <p className="text-xs text-text-muted font-mono">performs: POST/PUT/DELETE /api/v1/projects</p>
                </div>
                <button
                  onClick={openAddProj}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects Table */}
              <div className="overflow-x-auto border border-card-border rounded-lg">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-card-bg/80 border-b border-card-border text-xs uppercase font-bold text-text-muted">
                      <th className="p-4">Title</th>
                      <th className="p-4">Tags</th>
                      <th className="p-4">GitHub</th>
                      <th className="p-4">Live</th>
                      <th className="p-4">Order</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-text-muted font-mono text-xs">no_records_found</td>
                      </tr>
                    ) : (
                      projects.map((proj) => (
                        <tr key={proj.id} className="border-b border-card-border hover:bg-card-bg/25 transition-colors">
                          <td className="p-4 font-bold">{proj.title}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {proj.tech_tags.map((tag: string, i: number) => (
                                <span key={i} className="text-[10px] font-mono bg-card-border/40 px-1.5 py-0.5 rounded text-text-muted">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-xs font-mono truncate max-w-xs">{proj.repo_link || "null"}</td>
                          <td className="p-4 text-xs font-mono truncate max-w-xs">{proj.live_link || "null"}</td>
                          <td className="p-4 font-mono text-xs">{proj.order_index}</td>
                          <td className="p-4 text-right flex justify-end space-x-2">
                            <button
                              onClick={() => openEditProj(proj)}
                              className="p-1.5 rounded border border-card-border hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProj(proj.id)}
                              className="p-1.5 rounded border border-card-border hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. TECHNOLOGIES TAB */}
          {activeTab === "technologies" && (
            <div className="space-y-6">
              <div className="border-b border-card-border pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Manage Technologies Stack</h3>
                  <p className="text-xs text-text-muted font-mono">performs: POST/PUT/DELETE /api/v1/technologies</p>
                </div>
                <button
                  onClick={openAddTech}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tech</span>
                </button>
              </div>

              {/* Technologies Table */}
              <div className="overflow-x-auto border border-card-border rounded-lg">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-card-bg/80 border-b border-card-border text-xs uppercase font-bold text-text-muted">
                      <th className="p-4">Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Proficiency</th>
                      <th className="p-4">Icon Name</th>
                      <th className="p-4">Order</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-text-muted font-mono text-xs">no_records_found</td>
                      </tr>
                    ) : (
                      techs.map((tech) => (
                        <tr key={tech.id} className="border-b border-card-border hover:bg-card-bg/25 transition-colors">
                          <td className="p-4 font-bold">{tech.name}</td>
                          <td className="p-4 font-mono text-xs">
                            <span className="bg-card-border/50 text-text-muted px-2 py-0.5 rounded text-[10px]">
                              {tech.category}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs">{tech.proficiency ? `${tech.proficiency}%` : "null"}</td>
                          <td className="p-4 font-mono text-xs text-text-muted">{tech.icon_name || "null"}</td>
                          <td className="p-4 font-mono text-xs">{tech.order_index}</td>
                          <td className="p-4 text-right flex justify-end space-x-2">
                            <button
                              onClick={() => openEditTech(tech)}
                              className="p-1.5 rounded border border-card-border hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTech(tech.id)}
                              className="p-1.5 rounded border border-card-border hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- MODAL DIALOGS --- */}

      {/* 1. EXPERIENCE MODAL */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card-bg border border-card-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h4 className="text-md font-bold font-mono">
                {expId ? `edit_experience_record: ${expId}` : "add_experience_record"}
              </h4>
              <button onClick={() => setExpModalOpen(false)} className="text-text-muted hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="space-y-4 font-mono text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Company</label>
                  <input
                    type="text"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Role</label>
                  <input
                    type="text"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Start Date</label>
                  <input
                    type="text"
                    value={expStart}
                    onChange={(e) => setExpStart(e.target.value)}
                    placeholder="e.g. Jan 2026"
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">End Date</label>
                  <input
                    type="text"
                    value={expEnd}
                    onChange={(e) => setExpEnd(e.target.value)}
                    placeholder="e.g. Dec 2026 or Present"
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Sort Order</label>
                  <input
                    type="number"
                    value={expOrder}
                    onChange={(e) => setExpOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Job Description</label>
                <textarea
                  rows={4}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpModalOpen(false)}
                  className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded font-bold transition-colors cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PROJECT MODAL */}
      {projModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card-bg border border-card-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h4 className="text-md font-bold font-mono">
                {projId ? `edit_project_record: ${projId}` : "add_project_record"}
              </h4>
              <button onClick={() => setProjModalOpen(false)} className="text-text-muted hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProj} className="space-y-4 font-mono text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Project Title</label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Sort Order</label>
                  <input
                    type="number"
                    value={projOrder}
                    onChange={(e) => setProjOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Technology Tags (comma-separated)</label>
                <input
                  type="text"
                  value={projTags}
                  onChange={(e) => setProjTags(e.target.value)}
                  placeholder="e.g. Python, FastAPI, Docker"
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">GitHub repository link</label>
                  <input
                    type="text"
                    value={projRepo}
                    onChange={(e) => setProjRepo(e.target.value)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Live application link</label>
                  <input
                    type="text"
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Description</label>
                <textarea
                  rows={4}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProjModalOpen(false)}
                  className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded font-bold transition-colors cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TECHNOLOGY MODAL */}
      {techModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card-bg border border-card-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h4 className="text-md font-bold font-mono">
                {techId ? `edit_tech_record: ${techId}` : "add_tech_record"}
              </h4>
              <button onClick={() => setTechModalOpen(false)} className="text-text-muted hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTech} className="space-y-4 font-mono text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Technology Name</label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="e.g. Kubernetes"
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Category</label>
                  <select
                    value={techCategory}
                    onChange={(e) => setTechCategory(e.target.value)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Proficiency (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={techProficiency}
                    onChange={(e) => setTechProficiency(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Icon Reference Name</label>
                  <input
                    type="text"
                    value={techIcon}
                    onChange={(e) => setTechIcon(e.target.value)}
                    placeholder="e.g. docker"
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Sort Order</label>
                  <input
                    type="number"
                    value={techOrder}
                    onChange={(e) => setTechOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTechModalOpen(false)}
                  className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded font-bold transition-colors cursor-pointer"
                >
                  Save Tech
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-card-bg/50 border-t border-card-border px-6 py-4 text-center font-mono text-xs text-text-muted mt-auto">
        <span>© {new Date().getFullYear()} mandell.tech CMS Dashboard • Clean Architecture Admin portal</span>
      </footer>
    </div>
  );
}
