const { User, Preference } = require("../models");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

class Controller {
  static async getProfile(req, res, next) {
    try {
      const { id } = req.user;

      const user = await User.findByPk(id, {
        attributes: ["id", "email", "name"],
      });

      if (!user) {
        return next({ status: 404, message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.log("🚀 ~ Controller ~ getProfile ~ error", error);
      next(error);
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const { id } = req.user;

      const user = await User.destroy({
        where: { id },
      });

      if (!user) {
        next(res.status(404).json({ message: "User not found" }));
        return;
      }

      res.status(200).json({ message: "Profile deleted", user });
    } catch (error) {
      console.log("🚀 ~ Controller ~ deleteProfile ~ error:", error);
      next(error);
    }
  }

  static async addPreference(req, res, next) {
    try {
      const { id } = req.user;

      const preference = await Preference.create({
        ...req.body,
        userId: id,
      });

      res.status(201).json(preference);
    } catch (error) {
      console.log("🚀 ~ Controller ~ addPreference ~ error:", error);
      next(error);
    }
  }

  static async getPreference(req, res, next) {
    try {
      const { id } = req.user;
      const preference = await Preference.findAll({ where: { userId: id } });

      res.status(200).json(preference);
    } catch (error) {
      console.log("🚀 ~ Controller ~ getPreference ~ error:", error);
      next(error);
    }
  }

  static async editPreference(req, res, next) {
    try {
      const { id } = req.params;
      const preference = await Preference.findByPk(id);

      if (!preference) {
        next(res.status(404).json({ message: "Preference not found" }));
        return;
      }

      await preference.update(req.body);

      res.status(200).json(preference);
    } catch (error) {
      console.log("🚀 ~ Controller ~ editPreference ~ error:", error);
      next(error);
    }
  }

  static async deletePreference(req, res, next) {
    try {
      const { id } = req.params;
      const preference = await Preference.destroy({
        where: { id },
      });

      if (!preference) {
        next(res.status(404).json({ message: "Preference not found" }));
        return;
      }

      res.status(200).json({ message: "Preference deleted" });
    } catch (error) {
      console.log("🚀 ~ Controller ~ deletePreference ~ error:", error);
      next(error);
    }
  }

  static async getExternalData(req, res, next) {
    try {
      const { id } = req.user;
      const page = +req.params.id;

      const preference = await Preference.findAll({ where: { userId: id } });
      const job = preference.map((preferences) => preferences.job);

      const apiUrl = `https://api.scrapingdog.com/linkedinjobs?api_key=67e4e54dff968bee9544b2f3&field=${job}&geoid=102478259&page=${page}`;

      const response = await axios.get(apiUrl);

      res.status(200).json(response.data);
    } catch (error) {
      console.log("🚀 ~ Controller ~ getExternalData ~ error:", error);
      next(error);
    }
  }

  static async getRecommendationFromAi(req, res, next) {
    try {
      const { id } = req.user;
      const preferences = await Preference.findAll({ where: { userId: id } });
      const job = preferences.map((preference) => preference.job);

      const apiUrl = `https://api.scrapingdog.com/linkedinjobs?api_key=67e4e54dff968bee9544b2f3&field=${job}&geoid=102478259&page=1&sortBy=&jobType=&expLevel=&workType=&filterByCompany=`;

      const apiResponse = await axios.get(apiUrl);

      const jobLink = apiResponse.data.map((job) => job.job_link);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Berikan saya rekomendasi pekerjaan dari data berikut ${jobLink} yang sesuai dengan kualifikasi saya berdasarkan data berikut ${JSON.stringify(
          preferences
        )}. PENTING: Respon harus dalam format JSON yang valid. Jangan sertakan penjelasan atau teks di luar array JSON. Format output harus tepat sesuai struktur berikut tanpa tambahan teks apapun: [{title: "judul pekerjaan", company: "nama perusahaan", description: "deskripsi singkat", match_reason: "alasan mengapa cocok dengan kualifikasi saya", job_link: "url pekerjaan"}]`,
      });

      // Try to parse the response as JSON, if not possible, try to fix it
      try {
        // First attempt: direct JSON parsing
        const parsedResponse = JSON.parse(response.text);
        res.status(200).json({
          success: true,
          message: "AI recommendations retrieved successfully",
          data: parsedResponse,
        });
      } catch (parseError) {
        try {
          // Second attempt: Try to extract JSON content from the response
          const text = response.text;

          // Look for JSON array pattern in the response
          const jsonMatch = text.match(/\[[\s\S]*\]/);

          if (jsonMatch) {
            // Try parsing the extracted JSON content
            const extractedJson = JSON.parse(jsonMatch[0]);
            res.status(200).json({
              success: true,
              message: "AI recommendations retrieved successfully",
              data: extractedJson,
            });
          } else {
            // Third attempt: Create structured data from unstructured text
            // Split by numbered items or line breaks
            const items = text
              .split(/\d+\.\s|\n\n/)
              .filter((item) => item.trim().length > 0);

            const structuredData = items.map((item) => {
              // Extract information using regex patterns or simple parsing
              const titleMatch = item.match(/Title:\s*(.+?)(?=\n|Company:|$)/i);
              const companyMatch = item.match(
                /Company:\s*(.+?)(?=\n|Description:|$)/i
              );
              const descriptionMatch = item.match(
                /Description:\s*(.+?)(?=\n|Match reason:|$)/i
              );
              const reasonMatch = item.match(
                /Match reason:|Reason:\s*(.+?)(?=\n|Job link:|URL:|$)/i
              );
              const linkMatch = item.match(
                /(?:Job link:|URL:)\s*(.+?)(?=\n|$)/i
              );

              return {
                title: titleMatch ? titleMatch[1].trim() : "Unknown title",
                company: companyMatch
                  ? companyMatch[1].trim()
                  : "Unknown company",
                description: descriptionMatch
                  ? descriptionMatch[1].trim()
                  : "No description available",
                match_reason: reasonMatch
                  ? reasonMatch[1].trim()
                  : "No match reason provided",
                job_link: linkMatch ? linkMatch[1].trim() : "#",
              };
            });

            res.status(200).json({
              success: true,
              message: "AI recommendations structured from text",
              data:
                structuredData.length > 0
                  ? structuredData
                  : [
                      {
                        title: "AI Response Processing",
                        company: "System",
                        description:
                          "The AI response could not be formatted as structured data",
                        match_reason:
                          "Please try again or refine your search criteria",
                        job_link: "#",
                      },
                    ],
            });
          }
        } catch (structuringError) {
          // If all parsing attempts fail, return a nicely formatted default structure
          res.status(200).json({
            success: true,
            message: "AI recommendations retrieved but could not be formatted",
            data: [
              {
                title: "Raw AI Response",
                company: "System Message",
                description: "The response could not be formatted as JSON",
                match_reason: "You can view the raw response below",
                job_link: "#",
              },
            ],
            raw_response: response.text,
          });
        }
      }
    } catch (error) {
      console.log("🚀 ~ Controller ~ getRecommendationFromAi ~ error:", error);
      next(error);
    }
  }
}

module.exports = Controller;
