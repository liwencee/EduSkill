const { getSupabaseClient } = require('../config/database');

async function getJobMatchesForUser(userId) {
  const db = getSupabaseClient();
  if (!db) return [];

  const { data: profile } = await db
    .from('graduate_profiles')
    .select('skills, location')
    .eq('user_id', userId)
    .single();

  if (!profile || !profile.skills?.length) return [];

  // Skills-based matching: find active jobs that overlap with the user's skills
  const { data: jobs, error } = await db
    .from('job_listings')
    .select('id, title, type, location, required_skills, employer:users(id, name)')
    .eq('active', true)
    .overlaps('required_skills', profile.skills)
    .limit(20);

  if (error) throw new Error(error.message);

  // Score each match by number of overlapping skills
  return jobs
    .map((job) => {
      const overlap = job.required_skills.filter((s) => profile.skills.includes(s));
      return { ...job, matchScore: Math.round((overlap.length / job.required_skills.length) * 100) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { getJobMatchesForUser };
