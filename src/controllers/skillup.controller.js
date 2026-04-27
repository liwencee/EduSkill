const skillUpService = require('../services/skillup.service');
const { success, created, notFound, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');

async function listCourses(req, res) {
  try {
    const { category, language, page = 1, limit = 20 } = req.query;
    const courses = await skillUpService.listCourses({ category, language, page: +page, limit: +limit });
    return success(res, courses);
  } catch (err) {
    return error(res, 'Failed to fetch courses', 500);
  }
}

async function getCourse(req, res) {
  try {
    const course = await skillUpService.getCourseById(req.params.id);
    if (!course) return notFound(res, 'Course not found');
    return success(res, course);
  } catch (err) {
    return error(res, 'Failed to fetch course', 500);
  }
}

async function enrollCourse(req, res) {
  try {
    const enrollment = await skillUpService.enrollYouth(req.user.id, req.params.id);
    return created(res, enrollment, 'Enrolled successfully');
  } catch (err) {
    return error(res, err.message || 'Enrollment failed', 400);
  }
}

async function updateProgress(req, res) {
  try {
    const { lessonId, completed } = req.body;
    const progress = await skillUpService.updateProgress(req.user.id, req.params.id, lessonId, completed);
    return success(res, progress, 'Progress updated');
  } catch (err) {
    return error(res, 'Failed to update progress', 500);
  }
}

async function getMyCourses(req, res) {
  try {
    const courses = await skillUpService.getEnrolledCourses(req.user.id);
    return success(res, courses);
  } catch (err) {
    return error(res, 'Failed to fetch enrolled courses', 500);
  }
}

async function getMyCertificates(req, res) {
  try {
    const certs = await skillUpService.getYouthCertificates(req.user.id);
    return success(res, certs);
  } catch (err) {
    return error(res, 'Failed to fetch certificates', 500);
  }
}

async function listStudyGroups(req, res) {
  try {
    const groups = await skillUpService.listStudyGroups(req.query);
    return success(res, groups);
  } catch (err) {
    return error(res, 'Failed to fetch study groups', 500);
  }
}

async function createStudyGroup(req, res) {
  try {
    const { name, courseId, maxMembers } = req.body;
    const group = await skillUpService.createStudyGroup({ name, courseId, maxMembers, creatorId: req.user.id });
    logger.info('Study group created', { userId: req.user.id, groupName: name });
    return created(res, group, 'Study group created');
  } catch (err) {
    return error(res, 'Failed to create study group', 500);
  }
}

module.exports = {
  listCourses, getCourse, enrollCourse, updateProgress,
  getMyCourses, getMyCertificates, listStudyGroups, createStudyGroup,
};
