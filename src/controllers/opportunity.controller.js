const opportunityService = require('../services/opportunity.service');
const matchingService = require('../services/matching.service');
const { success, created, notFound, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');

async function listJobs(req, res) {
  try {
    const { skill, location, type, page = 1, limit = 20 } = req.query;
    const jobs = await opportunityService.listJobs({ skill, location, type, page: +page, limit: +limit });
    return success(res, jobs);
  } catch (err) {
    return error(res, 'Failed to fetch jobs', 500);
  }
}

async function getJob(req, res) {
  try {
    const job = await opportunityService.getJobById(req.params.id);
    if (!job) return notFound(res, 'Job not found');
    return success(res, job);
  } catch (err) {
    return error(res, 'Failed to fetch job', 500);
  }
}

async function createJob(req, res) {
  try {
    const { title, description, type, location, requiredSkills, salaryRange } = req.body;
    const job = await opportunityService.createJob({
      title, description, type, location, requiredSkills, salaryRange,
      employerId: req.user.id,
    });
    logger.info('Job listing created', { employerId: req.user.id, jobId: job.id });
    return created(res, job, 'Job listing created');
  } catch (err) {
    return error(res, 'Failed to create job listing', 500);
  }
}

async function applyForJob(req, res) {
  try {
    const { coverNote } = req.body;
    const application = await opportunityService.applyForJob({
      jobId: req.params.id,
      applicantId: req.user.id,
      coverNote,
    });
    return created(res, application, 'Application submitted');
  } catch (err) {
    return error(res, err.message || 'Application failed', 400);
  }
}

async function listGraduateProfiles(req, res) {
  try {
    const { skill, location, page = 1 } = req.query;
    const profiles = await opportunityService.listGraduateProfiles({ skill, location, page: +page });
    return success(res, profiles);
  } catch (err) {
    return error(res, 'Failed to fetch profiles', 500);
  }
}

async function getMyApplications(req, res) {
  try {
    const applications = await opportunityService.getUserApplications(req.user.id);
    return success(res, applications);
  } catch (err) {
    return error(res, 'Failed to fetch applications', 500);
  }
}

async function getMyJobMatches(req, res) {
  try {
    const matches = await matchingService.getJobMatchesForUser(req.user.id);
    return success(res, matches);
  } catch (err) {
    return error(res, 'Failed to fetch job matches', 500);
  }
}

module.exports = {
  listJobs, getJob, createJob, applyForJob,
  listGraduateProfiles, getMyApplications, getMyJobMatches,
};
