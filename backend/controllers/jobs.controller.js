import * as jobsService from "../services/jobs.service.js";

export const getJobs = async (req, res, next) => {
  try {
    const filters = {
      query: req.query.query || "",
      state: req.query.state || "All India",
      category: req.query.category || "All Categories",
      qualification: req.query.qualification || "Any",
      jobType: req.query.jobType || "All Types",
    };
    const locationContext = req.query.locationContext || "";

    const result = await jobsService.fetchJobs(filters, locationContext);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const response = await jobsService.chatWithGemini(message, history || []);
    res.json({ success: true, data: { response } });
  } catch (error) {
    next(error);
  }
};

export const sync = async (req, res, next) => {
  try {
    const result = await jobsService.syncAllSources();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const savedJobs = await jobsService.getSavedJobs(userId);
    res.json({ success: true, data: savedJobs });
  } catch (error) {
    next(error);
  }
};

export const toggleSavedJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const { isSaved } = req.body || {};

    if (isSaved) {
      await jobsService.saveJob(userId, jobId);
    } else {
      await jobsService.unsaveJob(userId, jobId);
    }

    res.json({ success: true, message: isSaved ? "Job saved" : "Job unsaved" });
  } catch (error) {
    next(error);
  }
};

