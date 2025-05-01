const Controller = require("../Controllers/controller");
const { User, Preference } = require("../models");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

// Mock dependencies
jest.mock("../models");
jest.mock("axios");
jest.mock("@google/genai");

describe("Controller Extended Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: { id: "1" },
      body: { job: "Software Engineer" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should handle database errors correctly", async () => {
      const error = new Error("Database connection error");
      User.findByPk.mockRejectedValue(error);

      await Controller.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteProfile", () => {
    it("should handle successful deletion", async () => {
      User.destroy.mockResolvedValue(1);

      await Controller.deleteProfile(req, res, next);

      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Profile deleted",
        user: 1,
      });
    });

    it("should handle user not found scenario", async () => {
      User.destroy.mockResolvedValue(0);
      res.status.mockImplementation(() => {
        return {
          json: jest.fn().mockReturnValue({ message: "User not found" }),
        };
      });

      await Controller.deleteProfile(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("addPreference", () => {
    it("should add preference with valid data", async () => {
      const mockPreference = { id: 1, job: "Software Engineer", userId: 1 };
      Preference.create.mockResolvedValue(mockPreference);

      await Controller.addPreference(req, res, next);

      expect(Preference.create).toHaveBeenCalledWith({
        job: "Software Engineer",
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPreference);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      Preference.create.mockRejectedValue(error);

      await Controller.addPreference(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getPreference", () => {
    it("should return preferences array", async () => {
      const mockPreferences = [
        { id: 1, job: "Software Engineer", userId: 1 },
        { id: 2, job: "Data Scientist", userId: 1 },
      ];
      Preference.findAll.mockResolvedValue(mockPreferences);

      await Controller.getPreference(req, res, next);

      expect(Preference.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPreferences);
    });

    it("should return empty array if no preferences found", async () => {
      Preference.findAll.mockResolvedValue([]);

      await Controller.getPreference(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe("editPreference", () => {
    it("should successfully update preference", async () => {
      const mockPreference = {
        id: 1,
        job: "Software Engineer",
        userId: 1,
        update: jest.fn().mockResolvedValue({
          id: 1,
          job: "Senior Software Engineer",
          userId: 1,
        }),
      };
      Preference.findByPk.mockResolvedValue(mockPreference);
      req.body = { job: "Senior Software Engineer" };

      await Controller.editPreference(req, res, next);

      expect(Preference.findByPk).toHaveBeenCalledWith("1");
      expect(mockPreference.update).toHaveBeenCalledWith({
        job: "Senior Software Engineer",
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle preference not found", async () => {
      Preference.findByPk.mockResolvedValue(null);
      res.status.mockImplementation(() => {
        return {
          json: jest.fn().mockReturnValue({ message: "Preference not found" }),
        };
      });

      await Controller.editPreference(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("deletePreference", () => {
    it("should successfully delete preference", async () => {
      Preference.destroy.mockResolvedValue(1);

      await Controller.deletePreference(req, res, next);

      expect(Preference.destroy).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Preference deleted" });
    });

    it("should handle preference not found", async () => {
      Preference.destroy.mockResolvedValue(0);
      res.status.mockImplementation(() => {
        return {
          json: jest.fn().mockReturnValue({ message: "Preference not found" }),
        };
      });

      await Controller.deletePreference(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getExternalData", () => {
    it("should fetch and return external data", async () => {
      const mockPreferences = [{ job: "Software Engineer", userId: 1 }];
      const mockJobData = [{ title: "Senior Developer", company: "Google" }];

      Preference.findAll.mockResolvedValue(mockPreferences);
      axios.get.mockResolvedValue({ data: mockJobData });

      await Controller.getExternalData(req, res, next);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("Software Engineer")
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockJobData);
    });

    it("should handle empty preference list", async () => {
      Preference.findAll.mockResolvedValue([]);
      axios.get.mockResolvedValue({ data: [] });

      await Controller.getExternalData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should handle API errors", async () => {
      const mockPreferences = [{ job: "Software Engineer", userId: 1 }];
      const error = new Error("API error");

      Preference.findAll.mockResolvedValue(mockPreferences);
      axios.get.mockRejectedValue(error);

      await Controller.getExternalData(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getRecommendationFromAi", () => {
    it("should get AI recommendations and return parsed JSON", async () => {
      // Mock preferences and API response
      const mockPreferences = [{ job: "Software Engineer", userId: 1 }];
      const mockJobLinks = [{ job_link: "https://example.com/job/1" }];

      Preference.findAll.mockResolvedValue(mockPreferences);
      axios.get.mockResolvedValue({ data: mockJobLinks });

      // Mock AI response that parses successfully as JSON
      const validJsonResponse =
        '[{"title":"Software Engineer","company":"Google","description":"Engineering role","match_reason":"Skills match","job_link":"https://example.com/job/1"}]';

      const mockGenerateContent = jest
        .fn()
        .mockResolvedValue({ text: validJsonResponse });
      const mockModels = { generateContent: mockGenerateContent };
      GoogleGenAI.mockImplementation(() => ({ models: mockModels }));

      await Controller.getRecommendationFromAi(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "AI recommendations retrieved successfully",
        data: expect.arrayContaining([
          expect.objectContaining({
            title: "Software Engineer",
            company: "Google",
          }),
        ]),
      });
    });

    it("should handle AI response with pattern-matched JSON", async () => {
      // Mock preferences and API response
      const mockPreferences = [{ job: "Software Engineer", userId: 1 }];
      const mockJobLinks = [{ job_link: "https://example.com/job/1" }];

      Preference.findAll.mockResolvedValue(mockPreferences);
      axios.get.mockResolvedValue({ data: mockJobLinks });

      // Mock AI response with text that contains JSON array inside other text
      const textWithJson =
        'Here are your recommendations: [{"title":"Software Engineer","company":"Google"}]';

      const mockGenerateContent = jest
        .fn()
        .mockResolvedValue({ text: textWithJson });
      const mockModels = { generateContent: mockGenerateContent };
      GoogleGenAI.mockImplementation(() => ({ models: mockModels }));

      await Controller.getRecommendationFromAi(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Software Engineer",
            company: "Google",
          }),
        ])
      );
    });

    it("should handle unstructured AI response", async () => {
      // Mock preferences and API response
      const mockPreferences = [{ job: "Software Engineer", userId: 1 }];
      const mockJobLinks = [{ job_link: "https://example.com/job/1" }];

      Preference.findAll.mockResolvedValue(mockPreferences);
      axios.get.mockResolvedValue({ data: mockJobLinks });

      // Mock AI response with text that cannot be parsed as JSON and has no pattern
      const unstructuredText =
        "Title: Software Engineer\nCompany: Google\nDescription: Great job\nMatch reason: Your skills match\nJob link: https://example.com/job";

      const mockGenerateContent = jest
        .fn()
        .mockResolvedValue({ text: unstructuredText });
      const mockModels = { generateContent: mockGenerateContent };
      GoogleGenAI.mockImplementation(() => ({ models: mockModels }));

      await Controller.getRecommendationFromAi(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data.length).toBeGreaterThan(0);
    });

    it("should handle completely unparseable AI response with default structure", async () => {
      // Mock preferences and API response
      const mockPreferences = [{ job: "Software Engineer", userId: 1 }];
      const mockJobLinks = [{ job_link: "https://example.com/job/1" }];

      Preference.findAll.mockResolvedValue(mockPreferences);
      axios.get.mockResolvedValue({ data: mockJobLinks });

      // Completely unparseable text
      const impossibleText = "This cannot be parsed in any meaningful way";

      const mockGenerateContent = jest
        .fn()
        .mockResolvedValue({ text: impossibleText });
      const mockModels = { generateContent: mockGenerateContent };
      GoogleGenAI.mockImplementation(() => ({ models: mockModels }));

      await Controller.getRecommendationFromAi(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].data[0].title).toBe("Raw AI Response");
      expect(res.json.mock.calls[0][0].raw_response).toBe(impossibleText);
    });

    it("should handle AI API errors", async () => {
      // Mock preferences and API response
      const mockPreferences = [{ job: "Software Engineer", userId: 1 }];
      const mockJobLinks = [{ job_link: "https://example.com/job/1" }];

      Preference.findAll.mockResolvedValue(mockPreferences);
      axios.get.mockResolvedValue({ data: mockJobLinks });

      // Mock AI API error
      const error = new Error("AI API error");
      const mockGenerateContent = jest.fn().mockRejectedValue(error);
      const mockModels = { generateContent: mockGenerateContent };
      GoogleGenAI.mockImplementation(() => ({ models: mockModels }));

      await Controller.getRecommendationFromAi(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
