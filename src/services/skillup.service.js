const { v4: uuidv4 } = require('uuid');
const { getSupabaseClient } = require('../config/database');

async function listCourses({ category, language, page, limit }) {
  const db = getSupabaseClient();
  if (!db) return { items: [], total: 0, page, limit };

  let query = db.from('skillup_courses').select('*', { count: 'exact' }).eq('published', true);
  if (category) query = query.eq('category', category);
  if (language) query = query.contains('languages', [language]);

  const from = (page - 1) * limit;
  const { data, count, error } = await query.range(from, from + limit - 1).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { items: data, total: count, page, limit };
}

async function getCourseById(id) {
  const db = getSupabaseClient();
  if (!db) return null;
  const { data } = await db.from('skillup_courses').select('*, lessons(*)').eq('id', id).single();
  return data;
}

async function enrollYouth(userId, courseId) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');

  const { data: existing } = await db
    .from('skillup_enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  if (existing) throw new Error('Already enrolled in this course');

  const enrollment = {
    id: uuidv4(), user_id: userId, course_id: courseId,
    progress: 0, enrolled_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('skillup_enrollments').insert(enrollment).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateProgress(userId, courseId, lessonId, completed) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');

  const record = {
    id: uuidv4(), user_id: userId, course_id: courseId, lesson_id: lessonId,
    completed, updated_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('lesson_progress').upsert(record, { onConflict: 'user_id,lesson_id' }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function getEnrolledCourses(userId) {
  const db = getSupabaseClient();
  if (!db) return [];
  const { data, error } = await db
    .from('skillup_enrollments')
    .select('*, course:skillup_courses(id, title, category, thumbnail_url)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

async function getYouthCertificates(userId) {
  const db = getSupabaseClient();
  if (!db) return [];
  const { data, error } = await db
    .from('youth_certificates')
    .select('*, course:skillup_courses(id, title)')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

async function listStudyGroups({ courseId, page = 1, limit = 20 }) {
  const db = getSupabaseClient();
  if (!db) return { items: [], total: 0 };
  let query = db.from('study_groups').select('*, course:skillup_courses(id, title)', { count: 'exact' });
  if (courseId) query = query.eq('course_id', courseId);
  const from = ((+page) - 1) * (+limit);
  const { data, count, error } = await query.range(from, from + (+limit) - 1);
  if (error) throw new Error(error.message);
  return { items: data, total: count };
}

async function createStudyGroup({ name, courseId, maxMembers, creatorId }) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');
  const group = {
    id: uuidv4(), name, course_id: courseId, max_members: maxMembers,
    creator_id: creatorId, member_count: 1, created_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('study_groups').insert(group).select().single();
  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  listCourses, getCourseById, enrollYouth, updateProgress,
  getEnrolledCourses, getYouthCertificates, listStudyGroups, createStudyGroup,
};
