const { v4: uuidv4 } = require('uuid');
const { getSupabaseClient } = require('../config/database');

async function listCourses({ subject, level, page, limit }) {
  const db = getSupabaseClient();
  if (!db) return { items: [], total: 0, page, limit };

  let query = db.from('edupro_courses').select('*', { count: 'exact' }).eq('published', true);
  if (subject) query = query.ilike('subject', `%${subject}%`);
  if (level) query = query.eq('level', level);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { items: data, total: count, page, limit };
}

async function getCourseById(id) {
  const db = getSupabaseClient();
  if (!db) return null;
  const { data } = await db.from('edupro_courses').select('*').eq('id', id).single();
  return data;
}

async function enrollTeacher(userId, courseId) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');

  const { data: existing } = await db
    .from('edupro_enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  if (existing) throw new Error('Already enrolled in this course');

  const enrollment = { id: uuidv4(), user_id: userId, course_id: courseId, enrolled_at: new Date().toISOString() };
  const { data, error } = await db.from('edupro_enrollments').insert(enrollment).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function listMaterials({ subject, grade, page, limit }) {
  const db = getSupabaseClient();
  if (!db) return { items: [], total: 0, page, limit };

  let query = db.from('teaching_materials').select('*', { count: 'exact' });
  if (subject) query = query.ilike('subject', `%${subject}%`);
  if (grade) query = query.eq('grade_level', grade);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { items: data, total: count, page, limit };
}

async function getTeacherCertificates(userId) {
  const db = getSupabaseClient();
  if (!db) return [];
  const { data, error } = await db.from('cpd_certificates').select('*').eq('user_id', userId).order('issued_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

async function getCommunityPosts({ subject, page = 1, limit = 20 }) {
  const db = getSupabaseClient();
  if (!db) return { items: [], total: 0 };

  let query = db.from('community_posts').select('*, author:users(id, name)', { count: 'exact' });
  if (subject) query = query.eq('subject', subject);

  const from = ((+page) - 1) * (+limit);
  query = query.range(from, from + (+limit) - 1).order('created_at', { ascending: false });

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { items: data, total: count };
}

async function createCommunityPost({ title, content, subject, authorId }) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');

  const post = { id: uuidv4(), title, content, subject, author_id: authorId, created_at: new Date().toISOString() };
  const { data, error } = await db.from('community_posts').insert(post).select().single();
  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  listCourses, getCourseById, enrollTeacher, listMaterials,
  getTeacherCertificates, getCommunityPosts, createCommunityPost,
};
