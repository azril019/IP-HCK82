const { User, Preference } = require("../models");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

class Controller {
  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "email", "name"],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      // Handle validation errors - fix for line 39
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const result = await User.destroy({ where: { id: req.user.id } });

      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile deleted", user: result });
    } catch (error) {
      // Handle validation errors - fix for line 53
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async addPreference(req, res, next) {
    try {
      const preference = await Preference.create({
        ...req.body,
        userId: req.user.id,
      });

      res.status(201).json(preference);
    } catch (error) {
      // Handle validation errors - fix for line 64
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async getPreference(req, res, next) {
    try {
      const preferences = await Preference.findAll({
        where: { userId: req.user.id },
      });

      res.json(preferences);
    } catch (error) {
      // Handle validation errors - fix for line 82
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async editPreference(req, res, next) {
    try {
      const preference = await Preference.findByPk(req.params.id);

      if (!preference) {
        return res.status(404).json({ message: "Preference not found" });
      }

      const updatedPreference = await preference.update(req.body);
      res.json(updatedPreference);
    } catch (error) {
      // Handle validation errors - fix for line 100
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async deletePreference(req, res, next) {
    try {
      const result = await Preference.destroy({
        where: { id: req.params.id },
      });

      if (!result) {
        return res.status(404).json({ message: "Preference not found" });
      }

      res.json({ message: "Preference deleted" });
    } catch (error) {
      // Handle validation errors - fix for line 118
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async getExternalData(req, res, next) {
    try {
      const page = req.params.id || 1;
      const preferences = await Preference.findAll({
        where: { userId: req.user.id },
      });

      // Check if preferences exist - fix for line 227
      if (!preferences.length) {
        return res.status(404).json({ message: "No preferences found" });
      }

      // Build job titles based on preferences
      const jobTitles = preferences.map((pref) => pref.job).join(", ");

      const apiKey = process.env.API_KEY;
      const response = await axios.get(
        `https://api.scrapingdog.com/linkedinjobs?api_key=${apiKey}&search=${jobTitles}&location=Indonesia&page=${page}`
      );

      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendationFromAi(req, res, next) {
    try {
      // Get user preferences
      const preferences = await Preference.findAll({
        where: { userId: req.user.id },
      });

      // Get job data from external API
      const apiKey = process.env.API_KEY;
      const response = await axios.get(
        `https://api.scrapingdog.com/linkedinjobs?api_key=${apiKey}&search=${preferences
          .map((pref) => pref.job)
          .join(", ")}&location=Indonesia`
      );

      // Extract job links
      const jobLinks = response.data.map((job) => job.job_link).join("\n");

      // Initialize Google Generative AI
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const model = genAI.models;

      // Create prompt for AI
      const userPrefs = preferences
        .map(
          (pref) =>
            `Job: ${pref.job}, Location: ${pref.location}, Degree: ${pref.degree}, Skills: ${pref.skill}`
        )
        .join("\n");

      const prompt = `Based on the following user preferences:\n${userPrefs}\n\nAnd these job posting links:\n${jobLinks}\n\nProvide personalized job recommendations as a JSON array with the following format for each job:\n[{"title": "Job Title", "company": "Company Name", "description": "Brief description", "match_reason": "Why this matches the user", "job_link": "URL"}]\n\nLimit to 5 best matches.`;

      // Generate content using AI
      const result = await model.generateContent(prompt);
      let aiText = result.text;

      // Extract JSON from response
      let recommendations = [];
      try {
        // Try to find JSON pattern in the response
        const jsonMatch = aiText.match(/\[.*\]/s);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON pattern found, return the raw text
          recommendations = [{ raw_response: aiText }];
        }
      } catch (error) {
        // If parsing fails, return the raw text
        recommendations = [{ raw_response: aiText }];
      }

      res.json({
        success: true,
        message: "AI recommendations retrieved successfully",
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
