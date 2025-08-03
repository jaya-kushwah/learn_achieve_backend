const mongoose = require("mongoose");
const mockTestService = require("../service/mockTestService");
const { mockTestValidation } = require("../validation/mockTestValidation");

const mockTestController = {
  // Create or Update MockTest
 createandUpdate: async (req, res) => {
  try {
    const id = req.body.id || null; // ID from body instead of req.params
    const data = {
      ...req.body,
      medium: Array.isArray(req.body.medium)
        ? req.body.medium
        : (req.body.medium || "").split(",").map(s => s.trim()),
      class: Array.isArray(req.body.class)
        ? req.body.class
        : (req.body.class || "").split(",").map(s => s.trim()),
      subjects: Array.isArray(req.body.subjects)
        ? req.body.subjects
        : (req.body.subjects || "").split(",").map(s => s.trim()),
    };

    // Validation
    const { error } = mockTestValidation.validate(data);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const allIds = [...data.class, ...data.subjects];
    for (const item of allIds) {
      if (!mongoose.Types.ObjectId.isValid(item)) {
        return res.status(400).json({ message: `Invalid ObjectId: ${item}` });
      }
    }

    const result = await mockTestService.createAndUpdate(data, id);
    res.status(id ? 200 : 201).json({ message: id ? "Mock test updated" : "Mock test created", mockTest: result });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
},
  // Get all + search + pagination + get by ID (combined)
  getPaginatedOrSingleMockTest: async (req, res) => {
    try {
      const { id, query = "", limit = 10, offset = 0 } = req.query;

      if (id) {
        const test = await mockTestService.getMockTestById(id);
        return res.status(200).json(test);
      }

      const result = await mockTestService.getPaginatedMockTests(query, parseInt(limit), parseInt(offset));
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch", error: err.message });
    }
  },

  // Change Status
 changeMockTestStatus: async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const mock = await mockTestService.getMockTestById(id);
    if (!mock) return res.status(404).json({ message: "Mock test not found" });

    if (mock.status === status) {
      return res.status(400).json({ message: `Mock test is already ${status}` });
    }

    const result = await mockTestService.updateMockTestStatus(id, status);
    res.status(200).json({ message: `Status updated to ${status}`, mockTest: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
},

  // Smart Delete (single or multiple)
  deleteMockTest: async (req, res) => {
    try {
      const { id, ids } = req.body;

      if (id) {
        const result = await mockTestService.deleteMockTest(id);
        return res.status(200).json(result);
      }

      if (Array.isArray(ids) && ids.length > 0) {
        const result = await mockTestService.deleteMultipleMockTests(ids);
        return res.status(200).json(result);
      }

      return res.status(400).json({ message: "Provide either 'id' or 'ids[]' to delete" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = mockTestController;
