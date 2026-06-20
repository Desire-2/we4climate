/**
 * We4Climate API client.
 *
 * All calls gracefully fall back to empty / zero data when the backend is
 * unreachable so the UI never hangs on a missing backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    if (!res.ok) {
      console.warn(`API ${res.status} on ${path}`, await res.text().catch(() => ""));
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`API request to ${path} failed – backend may be offline`, err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Types (mirrored from backend)                                      */
/* ------------------------------------------------------------------ */

export interface ApiPledge {
  id: number;
  name: string;
  district: string;
  trees_count: number;
  tree_type: string;
  timestamp: string;
}

export interface ApiCertificate {
  id: number;
  recipient_name: string;
  recipient_email: string;
  score: number;
  certificate_code: string;
  issued_at: string;
}

export interface ApiApplication {
  id: number;
  opportunity_id: string;
  applicant_name: string;
  applicant_email: string;
  resume_url: string | null;
  cover_letter: string | null;
  status: string;
  submitted_at: string;
}

export interface ApiDistrictMetric {
  id: number;
  district_name: string;
  province: string;
  province_key: string;
  description: string;
  species: string[];
  map_coords_x: number;
  map_coords_y: number;
  trees_planted: number;
  community_members: number;
  farmers_trained: number;
  active_sites: number;
}

export interface ApiImpactSummary {
  total_trees_planted: number;
  total_community_members: number;
  total_farmers_trained: number;
  total_active_sites: number;
}

/* ------------------------------------------------------------------ */
/*  Pledges                                                            */
/* ------------------------------------------------------------------ */

export async function fetchPledges(): Promise<ApiPledge[]> {
  const data = await request<ApiPledge[]>("/pledges");
  return data ?? [];
}

export async function createPledge(payload: {
  name: string;
  district: string;
  trees_count: number;
  tree_type: string;
}): Promise<ApiPledge | null> {
  return request<ApiPledge>("/pledges", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ */
/*  Certificates                                                       */
/* ------------------------------------------------------------------ */

export async function issueCertificate(payload: {
  recipient_name: string;
  recipient_email: string;
  score: number;
}): Promise<ApiCertificate | null> {
  return request<ApiCertificate>("/certificates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ */
/*  Opportunities (public postings)                                     */
/* ------------------------------------------------------------------ */

export interface ApiOpportunity {
  id: number;
  title: string;
  type: string;
  location: string;
  deadline: string | null;
  description: string;
  requirements: string[];
  is_external: boolean;
  external_url: string | null;
  is_active: boolean;
  created_at: string;
}

export async function fetchOpportunities(): Promise<ApiOpportunity[]> {
  const data = await request<ApiOpportunity[]>("/opportunities");
  return data ?? [];
}

/* ------------------------------------------------------------------ */
/*  Applications                                                       */
/* ------------------------------------------------------------------ */

export async function submitApplication(payload: {
  opportunity_id: string;
  applicant_name: string;
  applicant_email: string;
  resume_url?: string;
  cover_letter?: string;
}): Promise<{ message: string; application: ApiApplication } | null> {
  return request("/opportunities/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ */
/*  Impact                                                             */
/* ------------------------------------------------------------------ */

export async function fetchImpactSummary(): Promise<ApiImpactSummary | null> {
  return request<ApiImpactSummary>("/impact/summary");
}

export async function fetchDistrictMetrics(): Promise<ApiDistrictMetric[]> {
  const data = await request<ApiDistrictMetric[]>("/impact/districts");
  return data ?? [];
}

export async function fetchImpactStories(): Promise<ApiImpactStory[]> {
  const data = await request<ApiImpactStory[]>("/impact/stories");
  return data ?? [];
}

export interface ApiImpactStory {
  id: number;
  name: string;
  title: string;
  quote: string;
  initials: string;
  district_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Yearly Targets                                                     */
/* ------------------------------------------------------------------ */

export interface ApiYearlyTarget {
  id: number;
  year: number;
  trees_target: number;
  members_target: number;
  farmers_target: number;
  sites_target: number;
  created_at: string;
}

export async function fetchYearlyTargets(): Promise<ApiYearlyTarget[]> {
  const data = await request<ApiYearlyTarget[]>("/impact/yearly-targets");
  return data ?? [];
}

export async function adminFetchYearlyTargets(): Promise<ApiYearlyTarget[]> {
  const data = await adminRequest<ApiYearlyTarget[]>("/admin/yearly-targets");
  return data ?? [];
}

export async function adminCreateYearlyTarget(
  data: Omit<ApiYearlyTarget, "id" | "created_at">,
): Promise<ApiYearlyTarget | null> {
  return adminRequest<ApiYearlyTarget>("/admin/yearly-targets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateYearlyTarget(
  id: number,
  data: Partial<Omit<ApiYearlyTarget, "id" | "created_at">>,
): Promise<ApiYearlyTarget | null> {
  return adminRequest<ApiYearlyTarget>(`/admin/yearly-targets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteYearlyTarget(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/yearly-targets/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

/* ------------------------------------------------------------------ */
/*  Impact Goals (10 Pillars)                                          */
/* ------------------------------------------------------------------ */

export interface ApiImpactGoal {
  id: number;
  title: string;
  description: string;
  icon: string;
  milestone: string;
  action_details: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export async function fetchImpactGoals(): Promise<ApiImpactGoal[]> {
  const data = await request<ApiImpactGoal[]>("/impact/goals");
  return data ?? [];
}

export async function adminFetchGoals(): Promise<ApiImpactGoal[]> {
  const data = await adminRequest<ApiImpactGoal[]>("/admin/goals");
  return data ?? [];
}

export async function adminCreateGoal(
  data: Omit<ApiImpactGoal, "id" | "created_at">,
): Promise<ApiImpactGoal | null> {
  return adminRequest<ApiImpactGoal>("/admin/goals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateGoal(
  id: number,
  data: Partial<Omit<ApiImpactGoal, "id" | "created_at">>,
): Promise<ApiImpactGoal | null> {
  return adminRequest<ApiImpactGoal>(`/admin/goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteGoal(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(`/admin/goals/${id}`, {
    method: "DELETE",
  });
  return res !== null;
}

/* ------------------------------------------------------------------ */
/*  Webinars                                                             */
/* ------------------------------------------------------------------ */

export interface ApiWebinar {
  id: number;
  title: string;
  speaker: string;
  speaker_title: string | null;
  date: string;
  time: string;
  description: string;
  registered_count: number;
  max_capacity: number | null;
  is_active: boolean;
  created_at: string;
}

/** Fetch all active webinars (public). */
export async function fetchWebinars(): Promise<ApiWebinar[]> {
  const data = await request<ApiWebinar[]>("/webinars");
  return data ?? [];
}

/** Register for a webinar (public). */
export async function registerForWebinar(
  id: number,
): Promise<{ message: string; registered_count: number } | null> {
  return request(`/webinars/${id}/register`, { method: "POST" });
}

/** List all webinars (admin). */
export async function adminFetchWebinars(): Promise<ApiWebinar[]> {
  const data = await adminRequest<ApiWebinar[]>("/admin/webinars");
  return data ?? [];
}

/** Create a webinar (admin). */
export async function adminCreateWebinar(
  data: Omit<ApiWebinar, "id" | "registered_count" | "created_at">,
): Promise<ApiWebinar | null> {
  return adminRequest<ApiWebinar>("/admin/webinars", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Update a webinar (admin). */
export async function adminUpdateWebinar(
  id: number,
  data: Partial<Omit<ApiWebinar, "id" | "registered_count" | "created_at">>,
): Promise<ApiWebinar | null> {
  return adminRequest<ApiWebinar>(`/admin/webinars/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Delete a webinar (admin). */
export async function adminDeleteWebinar(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/webinars/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

/* ------------------------------------------------------------------ */
/*  Weekly Challenge                                                    */
/* ------------------------------------------------------------------ */

export interface ApiWeeklyChallengeQuestion {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ApiWeeklyChallenge {
  id: number;
  title: string;
  week_start: string;
  week_end: string;
  questions: ApiWeeklyChallengeQuestion[];
  is_active: boolean;
  completion_count: number;
  created_at: string;
}

/** Fetch the current active weekly challenge (public endpoint). */
export async function fetchActiveWeeklyChallenge(): Promise<ApiWeeklyChallenge | null> {
  return request<ApiWeeklyChallenge>("/weekly-challenge");
}

/** List all weekly challenges (admin). */
export async function adminFetchWeeklyChallenges(): Promise<ApiWeeklyChallenge[]> {
  const data = await adminRequest<ApiWeeklyChallenge[]>("/admin/weekly-challenges");
  return data ?? [];
}

/** Create a weekly challenge (admin). */
export async function adminCreateWeeklyChallenge(
  data: Omit<ApiWeeklyChallenge, "id" | "created_at">,
): Promise<ApiWeeklyChallenge | null> {
  return adminRequest<ApiWeeklyChallenge>("/admin/weekly-challenges", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Update a weekly challenge (admin). */
export async function adminUpdateWeeklyChallenge(
  id: number,
  data: Partial<Omit<ApiWeeklyChallenge, "id" | "created_at">>,
): Promise<ApiWeeklyChallenge | null> {
  return adminRequest<ApiWeeklyChallenge>(`/admin/weekly-challenges/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Record a completion on the active weekly challenge (public). */
export async function recordChallengeCompletion(): Promise<{
  message: string;
  completion_count: number;
} | null> {
  return request("/weekly-challenge/complete", { method: "POST" });
}

/** Delete a weekly challenge (admin). */
export async function adminDeleteWeeklyChallenge(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/weekly-challenges/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

/* ------------------------------------------------------------------ */
/*  Contact                                                            */
/* ------------------------------------------------------------------ */

export async function submitContact(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message: string } | null> {
  return request("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------------------------------------------ */
/*  Admin Auth                                                         */
/* ------------------------------------------------------------------ */

let _adminToken: string | null = localStorage.getItem("admin_token");

export function getAdminToken(): string | null {
  return _adminToken;
}

export function setAdminToken(token: string | null) {
  _adminToken = token;
  if (token) localStorage.setItem("admin_token", token);
  else localStorage.removeItem("admin_token");
}

async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  const token = getAdminToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });
    if (res.status === 401) {
      setAdminToken(null);
      return null;
    }
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<{ token: string; admin: { id: number; username: string } } | null> {
  const data = await request<{
    token: string;
    admin: { id: number; username: string };
  }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (data) setAdminToken(data.token);
  return data;
}

export async function adminVerify(): Promise<{
  valid: boolean;
  admin?: { id: number; username: string; created_at?: string };
} | null> {
  return adminRequest<{
    valid: boolean;
    admin?: { id: number; username: string; created_at?: string };
  }>("/admin/verify");
}

export async function adminLogout(): Promise<void> {
  await adminRequest("/admin/logout", { method: "POST" });
  setAdminToken(null);
}

export async function adminFetchStats(): Promise<{
  total_pledges: number;
  total_certificates: number;
  total_applications: number;
  total_contacts: number;
  total_districts: number;
  total_opportunities: number;
  total_stories: number;
  total_webinars: number;
  total_trees_planted: number;
} | null> {
  return adminRequest("/admin/stats");
}

export async function adminFetchOpportunities(page = 1): Promise<{
  items: ApiOpportunity[];
  total: number;
  page: number;
  pages: number;
} | null> {
  return adminRequest(`/admin/opportunities?page=${page}&per_page=50`);
}

export async function adminCreateOpportunity(
  data: Omit<ApiOpportunity, "id" | "created_at" | "is_active"> & { is_active?: boolean },
): Promise<ApiOpportunity | null> {
  return adminRequest("/admin/opportunities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateOpportunity(
  id: number,
  data: Partial<ApiOpportunity>,
): Promise<ApiOpportunity | null> {
  return adminRequest(`/admin/opportunities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteOpportunity(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/opportunities/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

export async function adminFetchPledges(page = 1): Promise<{
  items: ApiPledge[];
  total: number;
  page: number;
  pages: number;
} | null> {
  return adminRequest(`/admin/pledges?page=${page}&per_page=50`);
}

export async function adminDeletePledge(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/pledges/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

export async function adminFetchCertificates(
  page = 1,
  search = "",
): Promise<{
  items: ApiCertificate[];
  total: number;
  page: number;
  pages: number;
} | null> {
  const params = new URLSearchParams({ page: String(page), per_page: "50" });
  if (search) params.set("search", search);
  return adminRequest(`/admin/certificates?${params}`);
}

export async function adminFetchCertificateStats(): Promise<{
  total: number;
  perfect_scores: number;
  score_distribution: Record<string, number>;
} | null> {
  return adminRequest("/admin/certificates/stats");
}

export async function adminFetchCertificate(
  id: number,
): Promise<ApiCertificate | null> {
  return adminRequest<ApiCertificate>(`/admin/certificates/${id}`);
}

export async function adminCreateCertificate(
  data: { recipient_name: string; recipient_email: string; score: number },
): Promise<ApiCertificate | null> {
  return adminRequest<ApiCertificate>("/admin/certificates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateCertificate(
  id: number,
  data: Partial<{
    recipient_name: string;
    recipient_email: string;
    score: number;
  }>,
): Promise<ApiCertificate | null> {
  return adminRequest<ApiCertificate>(`/admin/certificates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteCertificate(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/certificates/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

export async function adminFetchApplications(page = 1): Promise<{
  items: ApiApplication[];
  total: number;
  page: number;
  pages: number;
} | null> {
  return adminRequest(`/admin/applications?page=${page}&per_page=50`);
}

export async function adminUpdateApplicationStatus(
  id: number,
  status: string,
): Promise<boolean> {
  const res = await adminRequest<ApiApplication>(
    `/admin/applications/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return res !== null;
}

export async function adminDeleteApplication(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/applications/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

export async function adminFetchContacts(page = 1): Promise<{
  items: Array<{
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    submitted_at: string;
  }>;
  total: number;
  page: number;
  pages: number;
} | null> {
  return adminRequest(`/admin/contacts?page=${page}&per_page=50`);
}

export async function adminDeleteContact(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/contacts/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

export async function adminFetchDistricts(): Promise<ApiDistrictMetric[] | null> {
  return adminRequest<ApiDistrictMetric[]>("/admin/districts");
}

export async function adminUpdateDistrict(
  id: number,
  data: Partial<ApiDistrictMetric>,
): Promise<boolean> {
  const res = await adminRequest<ApiDistrictMetric>(
    `/admin/districts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
  return res !== null;
}

export async function adminCreateDistrict(
  data: Omit<ApiDistrictMetric, "id">,
): Promise<ApiDistrictMetric | null> {
  return adminRequest<ApiDistrictMetric>("/admin/districts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteDistrict(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/districts/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

// -----------------------------------------------------------------------
// Admin – Impact Stories
// -----------------------------------------------------------------------

export async function adminFetchStories(): Promise<ApiImpactStory[]> {
  const data = await adminRequest<ApiImpactStory[]>("/admin/stories");
  return data ?? [];
}

export async function adminCreateStory(
  data: Omit<ApiImpactStory, "id" | "created_at">,
): Promise<ApiImpactStory | null> {
  return adminRequest<ApiImpactStory>("/admin/stories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateStory(
  id: number,
  data: Partial<Omit<ApiImpactStory, "id" | "created_at">>,
): Promise<ApiImpactStory | null> {
  return adminRequest<ApiImpactStory>(`/admin/stories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteStory(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/admin/stories/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}
