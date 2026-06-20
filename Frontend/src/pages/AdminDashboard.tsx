import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TreePine,
  Award,
  Briefcase,
  MessageSquare,
  Map,
  ArrowRight,
  Megaphone,
  Sparkles,
  Calendar,
  Users,
  Monitor,
} from "lucide-react";
import { adminFetchStats, fetchActiveWeeklyChallenge, type ApiWeeklyChallenge } from "../api/client";

interface Stats {
  total_pledges: number;
  total_certificates: number;
  total_applications: number;
  total_contacts: number;
  total_districts: number;
  total_opportunities: number;
  total_webinars: number;
  total_trees_planted: number;
}

const cards = [
  {
    key: "total_pledges" as const,
    label: "Pledges",
    icon: TreePine,
    color: "bg-emerald-100 text-emerald-700",
    link: "/admin/pledges",
  },
  {
    key: "total_certificates" as const,
    label: "Certificates",
    icon: Award,
    color: "bg-amber-100 text-amber-700",
    link: "/admin/certificates",
  },
  {
    key: "total_opportunities" as const,
    label: "Opportunities",
    icon: Megaphone,
    color: "bg-cyan-100 text-cyan-700",
    link: "/admin/opportunities",
  },
  {
    key: "total_webinars" as const,
    label: "Webinars",
    icon: Monitor,
    color: "bg-violet-100 text-violet-700",
    link: "/admin/webinars",
  },
  {
    key: "total_applications" as const,
    label: "Applications",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-700",
    link: "/admin/applications",
  },
  {
    key: "total_contacts" as const,
    label: "Messages",
    icon: MessageSquare,
    color: "bg-purple-100 text-purple-700",
    link: "/admin/contacts",
  },
  {
    key: "total_districts" as const,
    label: "Districts",
    icon: Map,
    color: "bg-rose-100 text-rose-700",
    link: "/admin/districts",
  },
  {
    key: "total_trees_planted" as const,
    label: "Trees Planted",
    icon: TreePine,
    color: "bg-emerald-100 text-emerald-700",
    link: "/admin/pledges",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [challenge, setChallenge] = useState<ApiWeeklyChallenge | null>(null);
  const [challengeLoaded, setChallengeLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminFetchStats().then(setStats);
    fetchActiveWeeklyChallenge().then((c) => {
      setChallenge(c);
      setChallengeLoaded(true);
    });
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all We4Climate platform data
        </p>
      </div>

      {/* ── Active Weekly Challenge Card ── */}
      {challengeLoaded && (
        <button
          onClick={() => navigate("/admin/weekly-challenges")}
          className="w-full mb-6 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 sm:p-6 text-left text-white hover:shadow-lg transition-all group relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full blur-sm" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-400/10 rounded-full blur-sm" />

          {challenge ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/15 rounded-xl flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-display font-bold text-lg">{challenge.title}</span>
                    <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/30">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-emerald-100/80">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(challenge.week_start).toLocaleDateString()} – {new Date(challenge.week_end).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-bold text-white">{challenge.completion_count || 0}</span>
                      completion{(challenge.completion_count || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <span>Manage Challenge</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 relative">
              <div className="p-3 bg-white/15 rounded-xl flex-shrink-0">
                <Sparkles className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <div className="font-display font-bold text-lg">No Active Challenge</div>
                <p className="text-xs text-emerald-100/70 mt-0.5">
                  Create a weekly challenge to power the Advocacy Passport quiz
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Create Challenge</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}
        </button>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key] : "—";
          return (
            <button
              key={card.key}
              onClick={() => navigate(card.link)}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-md transition-all group"
            >
              <div
                className={`inline-flex p-3 rounded-xl ${card.color} mb-4`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-display font-black text-gray-900">
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
                {card.label}
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Manage</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
