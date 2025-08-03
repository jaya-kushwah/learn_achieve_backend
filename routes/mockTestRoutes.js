const express = require("express");
const router = express.Router();
const mockTestController = require("../controller/mockTestController");
const { protect } = require("../middleware/authMiddleware");

//  Create or Update mock test
router.post("/add/", protect, mockTestController.createandUpdate);

//  Get All + Search + Pagination + Get By ID (combined)
router.get("/list/:id?", protect, mockTestController.getPaginatedOrSingleMockTest);
//  Delete single or multiple mock tests
router.delete("/delete", protect, mockTestController.deleteMockTest);

//  Change status of a mock test
router.put("/status/:id", protect, mockTestController.changeMockTestStatus);
module.exports = router;