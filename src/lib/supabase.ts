import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// ── Database helpers ──────────────────────────────────────────────

/** Submit a new membership application */
export async function submitApplication(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}) {
  const { error } = await supabase.from('applications').insert({
    ...data,
    status: 'Pending Review',
    submitted_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Fetch all applications (staff side) */
export async function fetchApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Update application status (approve/deny) */
export async function updateApplicationStatus(
  id: string,
  status: 'Approved' | 'Denied',
  tier?: string
) {
  const { error } = await supabase
    .from('applications')
    .update({ status, approved_tier: tier ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/** Upload a document to Supabase Storage */
export async function uploadDocument(file: File, folder: string) {
  const path = `${folder}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('mafs-documents').upload(path, file);
  if (error) throw error;
  return path;
}

/** Auth: sign in */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Auth: sign out */
export async function signOut() {
  return supabase.auth.signOut();
}

/** Auth: get current session */
export async function getSession() {
  return supabase.auth.getSession();
}
