const { v4: uuidv4 } = require('uuid');
const { getSupabaseClient } = require('../config/database');

async function listJobs({ skill, location, type, page, limit }) {
  const db = getSupabaseClient();
  if (!db) return { items: [], total: 0, page, limit };

  let query = db.from('job_listings').select('*, employer:users(id, name)', { count: 'exact' }).eq('active', true);
  if (skill) query = query.contains('required_skills', [skill]);
  if (location) query = query.ilike('location', `%${location}%`);
  if (type) query = query.eq('type', type);

  const from = (page - 1) * limit;
  const { data, count, error } = await query.range(from, from + limit - 1).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { items: data, total: count, page, limit };
}

async function getJobById(id) {
  const db = getSupabaseClient();
  if (!db) return null;
  const { data } = await db.from('job_listings').select('*, employer:users(id, name, email)').eq('id', id).single();
  return data;
}

async function createJob({ title, description, type, location, requiredSkills, salaryRange, employerId }) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');

  const job = {
    id: uuidv4(), title, description, type, location,
    required_skills: requiredSkills, salary_range: salaryRange,
    employer_id: employerId, active: true, created_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('job_listings').insert(job).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function applyForJob({ jobId, applicantId, coverNote }) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');

  const { data: existing } = await db
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('applicant_id', applicantId)
    .single();
  if (existing) throw new Error('Already applied for this job');

  const application = {
    id: uuidv4(), job_id: jobId, applicant_id: applicantId,
    cover_note: coverNote, status: 'pending', applied_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('job_applications').insert(application).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function listGraduateProfiles({ skill, location, page }) {
  const db = getSupabaseClient();
  if (!db) return { items: [], total: 0 };

  let query = db
    .from('graduate_profiles')
    .select('*, user:users(id, name)', { count: 'exact' })
    .eq('visible', true);

  if (skill) query = query.contains('skills', [skill]);
  if (location) query = query.ilike('location', `%${location}%`);

  const limit = 20;
  const from = (page - 1) * limit;
  const { data, count, error } = await query.range(from, from + limit - 1);
  if (error) throw new Error(error.message);
  return { items: data, total: count };
}

async function getUserApplications(userId) {
  const db = getSupabaseClient();
  if (!db) return [];
  const { data, error } = await db
    .from('job_applications')
    .select('*, job:job_listings(id, title, type, location)')
    .eq('applicant_id', userId)
    .order('applied_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  listJobs, getJobById, createJob, applyForJob, listGraduateProfiles, getUserApplications,
};
