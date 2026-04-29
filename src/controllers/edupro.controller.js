const eduProService = require('../services/edupro.service');
const lessonPlanService = require('../services/lessonPlan.service');
const { success, created, notFound, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');

async function listCourses(req, res) {
  try {
    const { subject, level, page = 1, limit = 20 } = req.query;
    const courses = await eduProService.listCourses({ subject, level, page: +page, limit: +limit });
    return success(res, courses);
  } catch (err) {
    logger.error('listCourses error', { error: err.message });
    return error(res, 'Failed to fetch courses', 500);
  }
}

async function getCourse(req, res) {
  try {
    const course = await eduProService.getCourseById(req.params.id);
    if (!course) return notFound(res, 'Course not found');
    return success(res, course);
  } catch (err) {
    return error(res, 'Failed to fetch course', 500);
  }
}

async function enrollCourse(req, res) {
  try {
    const enrollment = await eduProService.enrollTeacher(req.user.id, req.params.id);
    return created(res, enrollment, 'Enrolled successfully');
  } catch (err) {
    return error(res, err.message || 'Enrollment failed', 400);
  }
}

async function generateLessonPlan(req, res) {
  try {
    const { topic, gradeLevel, subject, duration, learningObjectives } = req.body;
    const plan = await lessonPlanService.generate({ topic, gradeLevel, subject, duration, learningObjectives, userId: req.user.id });
    logger.info('Lesson plan generated', { userId: req.user.id, topic });
    return success(res, plan, 'Lesson plan generated');
  } catch (err) {
    logger.error('Lesson plan generation error', { error: err.message });
    return error(res, 'Failed to generate lesson plan', 500);
  }
}

async function listMaterials(req, res) {
  try {
    const { subject, grade, page = 1, limit = 20 } = req.query;
    const materials = await eduProService.listMaterials({ subject, grade, page: +page, limit: +limit });
    return success(res, materials);
  } catch (err) {
    return error(res, 'Failed to fetch materials', 500);
  }
}

async function getMyCertificates(req, res) {
  try {
    const certificates = await eduProService.getTeacherCertificates(req.user.id);
    return success(res, certificates);
  } catch (err) {
    return error(res, 'Failed to fetch certificates', 500);
  }
}

async function getCommunityPosts(req, res) {
  try {
    const posts = await eduProService.getCommunityPosts(req.query);
    return success(res, posts);
  } catch (err) {
    return error(res, 'Failed to fetch community posts', 500);
  }
}

async function createCommunityPost(req, res) {
  try {
    const { title, content, subject } = req.body;
    const post = await eduProService.createCommunityPost({ title, content, subject, authorId: req.user.id });
    return created(res, post, 'Post created');
  } catch (err) {
    return error(res, 'Failed to create post', 500);
  }
}

module.exports = {
  listCourses, getCourse, enrollCourse, generateLessonPlan,
  listMaterials, getMyCertificates, getCommunityPosts, createCommunityPost,
};
