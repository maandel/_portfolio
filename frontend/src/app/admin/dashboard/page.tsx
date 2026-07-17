"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal, LogOut, User, Briefcase, Code, Plus, Trash2, Edit2,
  X, ShieldAlert, ShieldCheck, Database, ArrowLeft, Users, Shield, Loader2,
  FolderOpen, Cpu, GitBranch, ExternalLink, UserX, UserCheck
} from "lucide-react";
import * as api from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

/** Only allow http/https URLs — prevents javascript: XSS stored via CMS */
function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return ["http:", "https:"].includes(protocol) ? url : null;
  } catch {
    return null;
  }
}

const PAGE_SIZE = 5;

// Reusable Pagination component
const Pagination = ({
  total, page, onPage
}: { total: number; page: number; onPage: (p: number) => void }) => {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-card-border mt-2">
      <span className="text-xs font-mono text-text-muted">
        Page {page} of {totalPages} &nbsp;&middot;&nbsp; {total} records
      </span>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPage(1)}
          disabled={page === 1}
          className="px-2 py-1 text-xs font-mono rounded border border-card-border hover:bg-card-border/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          «
        </button>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 text-xs font-mono rounded border border-card-border hover:bg-card-border/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          ‹ Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "...")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-text-muted font-mono">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                  page === p
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "border-card-border hover:bg-card-border/40"
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="px-2 py-1 text-xs font-mono rounded border border-card-border hover:bg-card-border/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Next ›
        </button>
        <button
          onClick={() => onPage(totalPages)}
          disabled={page === totalPages}
          className="px-2 py-1 text-xs font-mono rounded border border-card-border hover:bg-card-border/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"bio" | "experiences" | "projects" | "technologies" | "users">("bio");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [loadingBio, setLoadingBio] = useState(false);
  const [loadingExp, setLoadingExp] = useState(false);
  const [loadingProj, setLoadingProj] = useState(false);
  const [loadingTech, setLoadingTech] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const [bioName, setBioName] = useState("");
  const [bioTitle, setBioTitle] = useState("");
  const [bioAbout, setBioAbout] = useState("");
  const [bioEmail, setBioEmail] = useState("");
  const [bioResume, setBioResume] = useState("");
  const [bioGithub, setBioGithub] = useState("");
  const [bioLinkedin, setBioLinkedin] = useState("");
  const [bioTwitter, setBioTwitter] = useState("");
  const [bioAvatar, setBioAvatar] = useState("");
  // bioId removed

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

  const [users, setUsers] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");

  // Pagination state
  const [expPage, setExpPage] = useState(1);
  const [projPage, setProjPage] = useState(1);
  const [techPage, setTechPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  // Reusable confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalAction, setConfirmModalAction] = useState<() => Promise<void> | void>(() => {});
  const [confirmModalType, setConfirmModalType] = useState<"danger" | "warning" | "info">("danger");

  const showConfirm = (title: string, message: string, onConfirm: () => Promise<void> | void, type: "danger" | "warning" | "info" = "danger") => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    setConfirmModalAction(() => onConfirm);
    setConfirmModalType(type);
    setConfirmModalOpen(true);
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        await api.getUsersCMS();
        setAuthorized(true);
        setAdminEmail("admin@mandell.tech");

        loadBioData();
        loadExperiencesData();
        loadProjectsData();
        loadTechnologiesData();
        loadUsersData();
      } catch {
        router.replace("/admin/login");
      }
    };
    initDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  async function loadBioData() {
    try {
      const data = await api.getProfile();
      // setBioId(data.id);
      setBioName(data.name || "");
      setBioTitle(data.title || "");
      setBioAbout(data.about_me || "");
      setBioEmail(data.email || "");
      setBioResume(data.resume_url || "");
      setBioGithub(data.github_url || "");
      setBioLinkedin(data.linkedin_url || "");
      setBioTwitter(data.twitter_url || "");
      setBioAvatar(data.avatar_url || "");
    } catch {
      console.log("No profile in DB yet.");
    }
  };

  const handleUpdateBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoadingBio(true);
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
    } finally {
      setLoadingBio(false);
    }
  };

  async function loadExperiencesData() {
    try {
      const data = await api.getExperiences();
      setExperiences(data);
      setExpPage(1);
    } catch (err) { console.error(err); }
  };

  const openAddExp = () => {
    setModalError("");
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
    setModalError("");
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
    setLoadingExp(true);
    setModalError("");
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
      setModalError(err.message || "Failed to save experience.");
    } finally {
      setLoadingExp(false);
    }
  };

  const handleDeleteExp = async (id: number) => {
    showConfirm(
      "Delete Experience",
      "Are you sure you want to delete this experience record?",
      async () => {
        setLoadingExp(true);
        try {
          await api.deleteExperienceCMS(id);
          showSuccess("Experience deleted!");
          loadExperiencesData();
        } catch (err: any) {
          showError(err.message || "Failed to delete experience.");
        } finally {
          setLoadingExp(false);
        }
      },
      "danger"
    );
  };

  async function loadProjectsData() {
    try {
      const data = await api.getProjects();
      setProjects(data);
      setProjPage(1);
    } catch (err) { console.error(err); }
  };

  const openAddProj = () => {
    setModalError("");
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
    setModalError("");
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
    setLoadingProj(true);
    setModalError("");
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
      setModalError(err.message || "Failed to save project.");
    } finally {
      setLoadingProj(false);
    }
  };

  const handleDeleteProj = async (id: number) => {
    showConfirm(
      "Delete Project",
      "Are you sure you want to delete this project record?",
      async () => {
        setLoadingProj(true);
        try {
          await api.deleteProjectCMS(id);
          showSuccess("Project deleted!");
          loadProjectsData();
        } catch (err: any) {
          showError(err.message || "Failed to delete project.");
        } finally {
          setLoadingProj(false);
        }
      },
      "danger"
    );
  };

  async function loadTechnologiesData() {
    try {
      const data = await api.getTechnologies();
      setTechs(data);
      setTechPage(1);
    } catch (err) { console.error(err); }
  };

  const openAddTech = () => {
    setModalError("");
    setTechId(null);
    setTechName("");
    setTechCategory("Backend");
    setTechProficiency(80);
    setTechIcon("");
    setTechOrder(0);
    setTechModalOpen(true);
  };

  const openEditTech = (tech: any) => {
    setModalError("");
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
    setLoadingTech(true);
    setModalError("");
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
      setModalError(err.message || "Failed to save technology.");
    } finally {
      setLoadingTech(false);
    }
  };

  const handleDeleteTech = async (id: number) => {
    showConfirm(
      "Delete Technology",
      "Are you sure you want to delete this technology record?",
      async () => {
        setLoadingTech(true);
        try {
          await api.deleteTechnologyCMS(id);
          showSuccess("Technology deleted!");
          loadTechnologiesData();
        } catch (err: any) {
          showError(err.message || "Failed to delete technology.");
        } finally {
          setLoadingTech(false);
        }
      },
      "danger"
    );
  };

  async function loadUsersData() {
    try {
      const data = await api.getUsersCMS();
      setUsers(data);
      setUserPage(1);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("401") || err.message.includes("Unauthorized") || err.message.includes("credentials"))) {
        handleLogout();
      }
    }
  };

  const openAddUser = () => {
    setModalError("");
    setEditingUserId(null);
    setUserEmail("");
    setUserPassword("");
    setUserIsAdmin(false);
    setUserModalOpen(true);
  };

  const handleToggleUserStatus = async (user: any) => {
    if (user.email === adminEmail) {
      showError("You cannot deactivate your own administrative account.");
      return;
    }
    const newStatus = !user.is_active;
    const action = newStatus ? "reactivate" : "deactivate";
    showConfirm(
      `${newStatus ? "Reactivate" : "Deactivate"} User`,
      `Are you sure you want to ${action} user ${user.email}?`,
      async () => {
        setLoadingUser(true);
        try {
          await api.updateUserStatusCMS(user.id, newStatus);
          showSuccess(`User ${user.email} has been successfully ${newStatus ? 'reactivated' : 'deactivated'}!`);
          loadUsersData();
        } catch (err: any) {
          showError(err.message || "Failed to update user status.");
        } finally {
          setLoadingUser(false);
        }
      },
      newStatus ? "info" : "warning"
    );
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUser(true);
    setModalError("");
    try {
      if (editingUserId) {
        const payload: any = {
          email: userEmail,
          is_admin: userIsAdmin
        };
        if (userPassword) {
          payload.password = userPassword;
        }
        await api.updateUserCMS(editingUserId, payload);
        showSuccess(`Successfully updated user details for: ${userEmail}`);
        if (editingUserId === users.find(u => u.email === adminEmail)?.id) {
          // localStorage.setItem("admin_email", userEmail);
          setAdminEmail(userEmail);
        }
      } else {
        await api.createUserCMS({
          email: userEmail,
          password: userPassword,
          is_admin: userIsAdmin
        });
        showSuccess(`Successfully registered new credentials: ${userEmail}`);
      }
      setUserModalOpen(false);
      setEditingUserId(null);
      setUserEmail("");
      setUserPassword("");
      setUserIsAdmin(false);
      loadUsersData();
    } catch (err: any) {
      setModalError(err.message || "Failed to save user.");
    } finally {
      setLoadingUser(false);
    }
  };

  const handleDeleteUser = async (id: number, email: string) => {
    showConfirm(
      "Delete User",
      `Are you sure you want to permanently delete the user account for ${email}? This action cannot be undone.`,
      async () => {
        setLoadingUser(true);
        try {
          await api.deleteUserCMS(id);
          showSuccess(`User ${email} has been permanently deleted!`);
          loadUsersData();
        } catch (err: any) {
          showError(err.message || "Failed to delete user.");
        } finally {
          setLoadingUser(false);
        }
      },
      "danger"
    );
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
    } catch {}
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
      <header className="bg-card-bg border-b border-card-border px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm">
        {/* Left Side */}
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center space-x-2 font-mono text-primary-500 font-bold text-sm sm:text-base min-w-0">
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">mandell.tech/admin/dashboard</span>
          </div>
          <span className="hidden xs:inline-block text-[10px] font-mono bg-card-border/50 text-text-muted px-2 py-0.5 rounded shrink-0">CMS Utility</span>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <Link href="/" className="inline-flex items-center space-x-1 text-xs text-text-muted hover:text-foreground font-mono transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Site</span>
          </Link>
          <ThemeToggle />
          <div className="h-4 w-[1px] bg-card-border" />
          <div className="flex items-center space-x-1 text-xs font-mono max-w-[100px] sm:max-w-none min-w-0">
            <span className="hidden md:inline text-text-muted select-none">User:</span>
            <span className="font-bold truncate max-w-[80px] sm:max-w-[150px]">{adminEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main CMS Split Panel */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-4 sm:gap-6">

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
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 cursor-pointer ${activeTab === "users"
                ? "bg-primary-500 text-white"
                : "bg-card-bg border border-card-border hover:bg-card-border/30"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
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
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Professional Title</label>
                    <input
                      type="text"
                      value={bioTitle}
                      onChange={(e) => setBioTitle(e.target.value)}
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={loadingBio}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Avatar URL</label>
                    <input
                      type="text"
                      value={bioAvatar}
                      onChange={(e) => setBioAvatar(e.target.value)}
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Resume link</label>
                    <input
                      type="text"
                      value={bioResume}
                      onChange={(e) => setBioResume(e.target.value)}
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">LinkedIn URL</label>
                    <input
                      type="text"
                      value={bioLinkedin}
                      onChange={(e) => setBioLinkedin(e.target.value)}
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-text-muted">Twitter/X URL</label>
                    <input
                      type="text"
                      value={bioTwitter}
                      onChange={(e) => setBioTwitter(e.target.value)}
                      disabled={loadingBio}
                      className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingBio}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold cursor-pointer transition-colors flex items-center justify-center space-x-2"
                >
                  {loadingBio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Saving Profile Settings...</span>
                    </>
                  ) : (
                    <span>Save Profile Settings</span>
                  )}
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
                  disabled={loadingExp}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {/* Experiences Table */}
              <div className="overflow-x-auto border border-card-border rounded-xl">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-card-bg/80 border-b border-card-border">
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Company</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Role</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Period</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-center">Order</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60">
                    {experiences.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-text-muted">
                            <Briefcase className="w-8 h-8 opacity-30" />
                            <span className="text-xs font-mono">No experience records yet</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      experiences.slice((expPage - 1) * PAGE_SIZE, expPage * PAGE_SIZE).map((exp) => (
                        <tr key={exp.id} className="hover:bg-primary-500/5 transition-colors group">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-sm">{exp.company}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-text-secondary">{exp.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-card-border/30 text-text-muted px-2 py-1 rounded-full whitespace-nowrap">
                              {exp.start_date} → {exp.end_date || <span className="text-green-400">Present</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block w-6 h-6 rounded-full bg-card-border/40 text-[11px] font-mono font-bold leading-6 text-center">{exp.order_index}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditExp(exp)}
                                disabled={loadingExp}
                                title="Edit"
                                className="p-1.5 rounded-lg border border-card-border hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExp(exp.id)}
                                disabled={loadingExp}
                                title="Delete"
                                className="p-1.5 rounded-lg border border-card-border hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={experiences.length} page={expPage} onPage={setExpPage} />
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
                  disabled={loadingProj}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects Table */}
              <div className="overflow-x-auto border border-card-border rounded-xl">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-card-bg/80 border-b border-card-border">
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Project</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Tech Stack</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-center">Links</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-center">Order</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60">
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-text-muted">
                            <FolderOpen className="w-8 h-8 opacity-30" />
                            <span className="text-xs font-mono">No projects added yet</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      projects.slice((projPage - 1) * PAGE_SIZE, projPage * PAGE_SIZE).map((proj) => {
                        const visibleTags = proj.tech_tags.slice(0, 3);
                        const extraCount = proj.tech_tags.length - 3;
                        return (
                          <tr key={proj.id} className="hover:bg-primary-500/5 transition-colors group">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-semibold text-sm leading-tight">{proj.title}</p>
                                {proj.description && (
                                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1 max-w-[180px]">{proj.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {visibleTags.map((tag: string, i: number) => (
                                  <span key={i} className="text-[10px] font-mono bg-primary-500/10 text-primary-400 border border-primary-500/20 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                    {tag}
                                  </span>
                                ))}
                                {extraCount > 0 && (
                                  <span className="text-[10px] font-mono bg-card-border/40 text-text-muted px-1.5 py-0.5 rounded-md" title={proj.tech_tags.slice(3).join(", ")}>
                                    +{extraCount}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                {(() => {
                                  const repoSafe = safeUrl(proj.repo_link);
                                  const liveSafe = safeUrl(proj.live_link);
                                  return (
                                    <>
                                      {repoSafe ? (
                                        <a href={repoSafe} target="_blank" rel="noopener noreferrer" title={repoSafe}
                                          className="p-1.5 rounded-lg border border-card-border hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                                        >
                                          <GitBranch className="w-3.5 h-3.5" />
                                        </a>
                                      ) : (
                                        <span className="p-1.5 opacity-20" title={proj.repo_link ? "Invalid URL" : "No repo link"}>
                                          <GitBranch className="w-3.5 h-3.5" />
                                        </span>
                                      )}
                                      {liveSafe ? (
                                        <a href={liveSafe} target="_blank" rel="noopener noreferrer" title={liveSafe}
                                          className="p-1.5 rounded-lg border border-card-border hover:border-green-500 hover:text-green-400 hover:bg-green-500/10 transition-all"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      ) : (
                                        <span className="p-1.5 opacity-20" title={proj.live_link ? "Invalid URL" : "No live link"}>
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-block w-6 h-6 rounded-full bg-card-border/40 text-[11px] font-mono font-bold leading-6 text-center">{proj.order_index}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEditProj(proj)}
                                  disabled={loadingProj}
                                  title="Edit"
                                  className="p-1.5 rounded-lg border border-card-border hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProj(proj.id)}
                                  disabled={loadingProj}
                                  title="Delete"
                                  className="p-1.5 rounded-lg border border-card-border hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={projects.length} page={projPage} onPage={setProjPage} />
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
                  disabled={loadingTech}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tech</span>
                </button>
              </div>

              {/* Technologies Table */}
              <div className="overflow-x-auto border border-card-border rounded-xl">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-card-bg/80 border-b border-card-border">
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Technology</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Category</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Proficiency</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">Icon Key</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-center">Order</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60">
                    {techs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-text-muted">
                            <Cpu className="w-8 h-8 opacity-30" />
                            <span className="text-xs font-mono">No technologies added yet</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      techs.slice((techPage - 1) * PAGE_SIZE, techPage * PAGE_SIZE).map((tech) => (
                        <tr key={tech.id} className="hover:bg-primary-500/5 transition-colors group">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-sm">{tech.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                              {tech.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {tech.proficiency ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-card-border/50 rounded-full overflow-hidden w-24">
                                  <div
                                    className="h-full bg-primary-500 rounded-full transition-all"
                                    style={{ width: `${tech.proficiency}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-mono text-text-muted tabular-nums">{tech.proficiency}%</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-text-muted/40 font-mono">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {tech.icon_name ? (
                              <code className="text-[11px] bg-card-border/30 text-amber-400 px-2 py-0.5 rounded font-mono">{tech.icon_name}</code>
                            ) : (
                              <span className="text-[11px] text-text-muted/40 font-mono">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block w-6 h-6 rounded-full bg-card-border/40 text-[11px] font-mono font-bold leading-6 text-center">{tech.order_index}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditTech(tech)}
                                disabled={loadingTech}
                                title="Edit"
                                className="p-1.5 rounded-lg border border-card-border hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTech(tech.id)}
                                disabled={loadingTech}
                                title="Delete"
                                className="p-1.5 rounded-lg border border-card-border hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={techs.length} page={techPage} onPage={setTechPage} />
            </div>
          )}

          {/* 5. USER MANAGEMENT TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="border-b border-card-border pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">User Management</h3>
                  <p className="text-xs text-text-muted font-mono">performs: GET/POST/PUT /api/v1/users</p>
                </div>
                <button
                  onClick={openAddUser}
                  disabled={loadingUser}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Admin/User</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto border border-card-border rounded-xl">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-card-bg/80 border-b border-card-border">
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted">User</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-center">Role</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-center">Status</th>
                      <th className="px-4 py-2.5 text-[11px] uppercase font-semibold tracking-wider text-text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-text-muted">
                            <Users className="w-8 h-8 opacity-30" />
                            <span className="text-xs font-mono">No users found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE).map((u) => (
                        <tr key={u.id} className="hover:bg-primary-500/5 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary-500/15 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-[11px] font-bold text-primary-400 uppercase">{u.email.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.email}</p>
                                <p className="text-[10px] text-text-muted font-mono">id: {u.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${
                              u.is_admin ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            }`}>
                              <Shield className="w-2.5 h-2.5" />
                              {u.is_admin ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                              u.is_active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ u.is_active ? "bg-green-400" : "bg-red-400" }`} />
                              {u.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setUserEmail(u.email);
                                setUserPassword("");
                                setUserIsAdmin(u.is_admin);
                                setUserModalOpen(true);
                              }}
                              disabled={loadingUser}
                              className="p-1.5 rounded-lg border border-card-border hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {u.email === adminEmail ? (
                              <span className="text-[10px] text-text-muted italic px-2 py-1 select-none bg-card-border/30 rounded-lg">You</span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  disabled={loadingUser}
                                  title={u.is_active ? "Deactivate user" : "Activate user"}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                    u.is_active 
                                      ? "border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500" 
                                      : "border-green-500/20 text-green-400 hover:bg-green-500/10 hover:border-green-500"
                                  }`}
                                >
                                  {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  disabled={loadingUser}
                                  className="p-1.5 rounded-lg border border-card-border hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                  title="Delete permanently"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={users.length} page={userPage} onPage={setUserPage} />
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

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExp} className="space-y-4 font-mono text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Company</label>
                  <input
                    type="text"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    disabled={loadingExp}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Role</label>
                  <input
                    type="text"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    disabled={loadingExp}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={loadingExp}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={loadingExp}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Sort Order</label>
                  <input
                    type="number"
                    value={expOrder}
                    onChange={(e) => setExpOrder(parseInt(e.target.value) || 0)}
                    disabled={loadingExp}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={loadingExp}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpModalOpen(false)}
                  disabled={loadingExp}
                  className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingExp}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingExp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Record</span>
                  )}
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
              <button 
                onClick={() => setProjModalOpen(false)} 
                disabled={loadingProj}
                className="text-text-muted hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProj} className="space-y-4 font-mono text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Project Title</label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    disabled={loadingProj}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Sort Order</label>
                  <input
                    type="number"
                    value={projOrder}
                    onChange={(e) => setProjOrder(parseInt(e.target.value) || 0)}
                    disabled={loadingProj}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={loadingProj}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={loadingProj}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Live application link</label>
                  <input
                    type="text"
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                    disabled={loadingProj}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Description</label>
                <textarea
                  rows={4}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  disabled={loadingProj}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none focus:border-primary-500 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProjModalOpen(false)}
                  disabled={loadingProj}
                  className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingProj}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingProj ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Project</span>
                  )}
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
              <button 
                onClick={() => setTechModalOpen(false)} 
                disabled={loadingTech}
                className="text-text-muted hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTech} className="space-y-4 font-mono text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Technology Name</label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="e.g. Kubernetes"
                  disabled={loadingTech}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted">Category</label>
                <div className="flex flex-wrap gap-2">
                  {["Frontend", "Backend", "Database", "DevOps", "Tools"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      disabled={loadingTech}
                      onClick={() => setTechCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        techCategory === cat
                          ? "bg-primary-500/10 border-primary-500 text-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.15)]"
                          : "bg-background border-card-border text-text-muted hover:border-primary-500/50 hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Proficiency (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={techProficiency}
                    onChange={(e) => setTechProficiency(parseInt(e.target.value) || 0)}
                    disabled={loadingTech}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Sort Order</label>
                  <input
                    type="number"
                    value={techOrder}
                    onChange={(e) => setTechOrder(parseInt(e.target.value) || 0)}
                    disabled={loadingTech}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Icon Reference Name</label>
                  <input
                    type="text"
                    value={techIcon}
                    onChange={(e) => setTechIcon(e.target.value)}
                    placeholder="e.g. docker"
                    disabled={loadingTech}
                    className="w-full bg-background border border-card-border rounded p-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTechModalOpen(false)}
                  disabled={loadingTech}
                  className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingTech}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingTech ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Tech</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. USER MODAL */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card-bg border border-card-border rounded-xl shadow-2xl p-6 space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h4 className="text-md font-bold font-mono">
                {editingUserId ? `edit_user_credentials: ${editingUserId}` : "register_user_credentials"}
              </h4>
              <button 
                onClick={() => {
                  setUserModalOpen(false);
                  setEditingUserId(null);
                }} 
                disabled={loadingUser}
                className="text-text-muted hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@domain.com"
                  disabled={loadingUser}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Password</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder={editingUserId ? "Leave blank to keep unchanged" : "At least 6 characters"}
                  disabled={loadingUser}
                  className="w-full bg-background border border-card-border rounded p-2 focus:outline-none font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  minLength={6}
                  required={!editingUserId}
                />
              </div>

              <div className="flex items-center space-x-2.5 py-1">
                <input
                  type="checkbox"
                  id="user-is-admin"
                  checked={userIsAdmin}
                  onChange={(e) => setUserIsAdmin(e.target.checked)}
                  disabled={loadingUser || (editingUserId !== null && users.find(usr => usr.id === editingUserId)?.email === adminEmail)}
                  className="w-4 h-4 bg-background border border-card-border rounded accent-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="user-is-admin" className="text-xs font-bold select-none cursor-pointer flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                  <Shield className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Grant Administrative Privileges
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserModalOpen(false);
                    setEditingUserId(null);
                  }}
                  disabled={loadingUser}
                  className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingUser}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white rounded font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{editingUserId ? "Saving..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{editingUserId ? "Save Changes" : "Create User"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card-bg border border-card-border rounded-xl shadow-2xl p-6 space-y-4 font-mono text-sm">
            <div className={`flex items-center space-x-3 border-b border-card-border pb-3 ${
              confirmModalType === "danger" 
                ? "text-red-500" 
                : confirmModalType === "warning" 
                  ? "text-amber-500" 
                  : "text-blue-500"
            }`}>
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-md font-bold uppercase">{confirmModalTitle}</h4>
            </div>
            <p className="text-foreground/80 leading-relaxed font-sans">{confirmModalMessage}</p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 bg-background border border-card-border hover:bg-card-bg rounded font-bold transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmModalOpen(false);
                  await confirmModalAction();
                }}
                className={`px-4 py-2 text-white rounded font-bold transition-colors cursor-pointer text-xs ${
                  confirmModalType === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmModalType === "warning"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-primary-500 hover:bg-primary-600"
                }`}
              >
                Confirm
              </button>
            </div>
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
