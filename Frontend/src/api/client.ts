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
  opportunity_title: string | null;
  applicant_name: string;
  applicant_email: string;
  resume_url: string | null;
  cover_letter: string | null;
  status: string;
  admin_notes: string;
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
}): Promise<{ message: string; application: ApiApplication } | { error: string; details?: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/opportunities/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      if (body) return { error: body.error || "Submission failed", details: body.details };
      return null;
    }
    return body as { message: string; application: ApiApplication };
  } catch {
    return null;
  }
}

/** Submit the full LRC volunteer application, including its attachments. */
export async function submitVolunteerApplication(payload: {
  opportunity_id: string;
  applicant_name: string;
  applicant_email: string;
  details: Record<string, unknown>;
  attachments: Record<string, File | null>;
}): Promise<{ message: string; application: ApiApplication } | null> {
  try {
    const body = new FormData();
    body.append("opportunity_id", payload.opportunity_id);
    body.append("applicant_name", payload.applicant_name);
    body.append("applicant_email", payload.applicant_email);
    body.append("cover_letter", JSON.stringify(payload.details));

    Object.entries(payload.attachments).forEach(([field, file]) => {
      if (file) body.append(field, file);
    });

    const res = await fetch(`${API_BASE}/opportunities/apply`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      console.warn(`API ${res.status} on /opportunities/apply`, await res.text().catch(() => ""));
      return null;
    }
    return (await res.json()) as { message: string; application: ApiApplication };
  } catch (err) {
    console.warn("Volunteer application request failed – backend may be offline", err);
    return null;
  }
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
}): Promise<{ message: string; email_sent?: boolean } | null> {
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
  const { headers: customHeaders, ...rest } = options;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...customHeaders,
      },
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
  const token = getAdminToken();
  if (!token) return { valid: false };
  try {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { valid: false };
    }
    if (!res.ok) return null; // transient error — don't clear token
    return (await res.json()) as { valid: boolean; admin?: { id: number; username: string; created_at?: string } };
  } catch {
    return null; // network error — don't clear token
  }
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
  total_volunteers: number;
} | null> {
  return adminRequest("/admin/stats");
}

export async function adminFetchOpportunities(
  page = 1,
  filter?: "active" | "inactive",
): Promise<{
  items: ApiOpportunity[];
  total: number;
  page: number;
  pages: number;
  active_count: number;
  inactive_count: number;
} | null> {
  const params = new URLSearchParams({ page: String(page), per_page: "50" });
  if (filter) params.set("status", filter);
  return adminRequest(`/admin/opportunities?${params.toString()}`);
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

export async function adminFetchApplications(
  page = 1,
  filters?: { status?: string; opportunity_id?: string; search?: string },
): Promise<{
  items: ApiApplication[];
  total: number;
  total_filtered: number;
  page: number;
  pages: number;
  status_counts: Record<string, number>;
} | null> {
  const params = new URLSearchParams({ page: String(page), per_page: "50" });
  if (filters?.status) params.set("status", filters.status);
  if (filters?.opportunity_id) params.set("opportunity_id", filters.opportunity_id);
  if (filters?.search) params.set("search", filters.search);
  return adminRequest(`/admin/applications?${params.toString()}`);
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

export async function adminUpdateApplicationNotes(
  id: number,
  admin_notes: string,
): Promise<boolean> {
  const res = await adminRequest<ApiApplication>(
    `/admin/applications/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ admin_notes }),
    },
  );
  return res !== null;
}

export async function adminBulkUpdateApplications(
  ids: number[],
  payload: { status?: string; admin_notes?: string },
): Promise<boolean> {
  const res = await adminRequest<{ message: string; updated: number }>(
    "/admin/applications/bulk",
    {
      method: "POST",
      body: JSON.stringify({ ids, ...payload }),
    },
  );
  return res !== null;
}

export function adminExportApplicationsUrl(filters?: { status?: string; opportunity_id?: string }): string {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.opportunity_id) params.set("opportunity_id", filters.opportunity_id);
  const token = localStorage.getItem("admin_token") || "";
  return `${API_BASE}/admin/applications/export?${params.toString()}&token=${encodeURIComponent(token)}`;
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

// -----------------------------------------------------------------------
// Admin – Profile Management
// -----------------------------------------------------------------------

export interface ApiAdminProfile {
  id: number;
  username: string;
  created_at: string;
}

/** Fetch the current admin user's profile. */
export async function adminFetchProfile(): Promise<ApiAdminProfile | null> {
  return adminRequest<ApiAdminProfile>("/admin/profile");
}

/** Update the current admin user's username. */
export async function adminUpdateProfile(
  username: string,
): Promise<ApiAdminProfile | null> {
  return adminRequest<ApiAdminProfile>("/admin/profile", {
    method: "PUT",
    body: JSON.stringify({ username }),
  });
}

/** Change the current admin user's password. */
export async function adminChangePassword(
  current_password: string,
  new_password: string,
): Promise<{ message: string } | null> {
  return adminRequest<{ message: string }>("/admin/password", {
    method: "PUT",
    body: JSON.stringify({ current_password, new_password }),
  });
}

/* ------------------------------------------------------------------ */
/*  Volunteers (dedicated management system)                            */
/* ------------------------------------------------------------------ */

export interface ApiVolunteer {
  id: number;
  full_name: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  country_of_residence: string;
  passport_number: string;
  email: string;
  phone: string;
  occupation: string;
  organization: string;
  emergency_full_name: string;
  emergency_relationship: string;
  emergency_country: string;
  emergency_phone: string;
  emergency_email: string;
  programs: string[];
  other_program: string;
  arrival_date: string;
  departure_date: string;
  length_of_stay: string;
  availability: string;
  educational_background: string;
  professional_experience: string;
  technical_skills: string;
  languages_spoken: string;
  previous_volunteer_experience: string;
  relevant_certifications: string;
  motivation: string;
  hope_to_learn: string;
  contribution: string;
  medical_conditions: string;
  allergies: string;
  dietary_requirements: string;
  emergency_medical_info: string;
  need_accommodation: string;
  room_preference: string;
  need_invitation_letter: string;
  need_airport_pickup: string;
  expected_arrival_airport: string;
  flight_details: string;
  media_consent: string;
  code_of_conduct: string[];
  declaration_accepted: boolean;
  applicant_name_declaration: string;
  signature: string;
  declaration_date: string;
  passport_copy_url: string;
  passport_photo_url: string;
  cv_url: string;
  motivation_letter_url: string;
  recommendation_letter_url: string;
  certificates_url: string;
  hours_logged: number;
  status: string;
  rating: number | null;
  admin_notes: string;
  status_message: string;
  submitted_at: string;
  updated_at: string;
}

/** Submit the full volunteer application via dedicated endpoint. */
export async function submitVolunteerApplicationNew(payload: {
  [key: string]: string | File | null | Record<string, unknown> | string[];
}): Promise<{ message: string; volunteer: ApiVolunteer } | null> {
  try {
    const body = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (value instanceof File) {
        body.append(key, value);
      } else if (typeof value === "object" && !(value instanceof File)) {
        body.append(key, JSON.stringify(value));
      } else {
        body.append(key, String(value));
      }
    });

    const res = await fetch(`${API_BASE}/volunteers`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      console.warn(`API ${res.status} on /volunteers`, await res.text().catch(() => ""));
      return null;
    }
    return (await res.json()) as { message: string; volunteer: ApiVolunteer };
  } catch (err) {
    console.warn("Volunteer application request failed – backend may be offline", err);
    return null;
  }
}

export async function adminFetchVolunteers(
  page = 1,
  filters?: { status?: string; search?: string; program?: string },
): Promise<{
  items: ApiVolunteer[];
  total: number;
  total_filtered: number;
  page: number;
  pages: number;
  status_counts: Record<string, number>;
} | null> {
  const params = new URLSearchParams({ page: String(page), per_page: "50" });
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.program) params.set("program", filters.program);
  return adminRequest(`/volunteers/admin?${params.toString()}`);
}

export async function adminGetVolunteer(id: number): Promise<ApiVolunteer | null> {
  return adminRequest<ApiVolunteer>(`/volunteers/admin/${id}`);
}

export async function adminUpdateVolunteer(
  id: number,
  data: Partial<{ status: string; status_message: string; hours_logged: number; rating: number | null; admin_notes: string }>,
): Promise<ApiVolunteer | null> {
  return adminRequest<ApiVolunteer>(`/volunteers/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function adminLogVolunteerHours(
  id: number,
  hours: number,
  description?: string,
): Promise<{ message: string; hours_logged: number; volunteer: ApiVolunteer } | null> {
  return adminRequest(`/volunteers/admin/${id}/hours`, {
    method: "POST",
    body: JSON.stringify({ hours, description }),
  });
}

export async function adminDeleteVolunteer(id: number): Promise<boolean> {
  const res = await adminRequest<{ message: string }>(
    `/volunteers/admin/${id}`,
    { method: "DELETE" },
  );
  return res !== null;
}

export async function adminBulkUpdateVolunteers(
  ids: number[],
  payload: { status?: string },
): Promise<boolean> {
  const res = await adminRequest<{ message: string; updated: number }>(
    "/volunteers/admin/bulk",
    {
      method: "POST",
      body: JSON.stringify({ ids, ...payload }),
    },
  );
  return res !== null;
}

export async function adminFetchVolunteerStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  active: number;
  completed: number;
  rejected: number;
  suspended: number;
  total_hours_logged: number;
  average_hours: number;
  top_programs: Array<{ name: string; count: number }>;
  top_nationalities: Array<{ name: string; count: number }>;
  availability_breakdown: Record<string, number>;
} | null> {
  return adminRequest("/volunteers/admin/stats");
}

export function adminExportVolunteersUrl(filters?: { status?: string }): string {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  const token = localStorage.getItem("admin_token") || "";
  return `${API_BASE}/volunteers/admin/export?${params.toString()}&token=${encodeURIComponent(token)}`;
}
