const packageService = require('../service/packageService');
 const Package = require('../model/Package');
 const mongoose = require('mongoose');
const SubQuestion = require('../model/subQuestionModel'); 
const QuestionBank = require('../model/questionModel');
const { Types } = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
// const Package = require('../model/Package'); // Your Package model
const Order = require('../model/Order'); 
const packageController = {
  //  Unified Add/Update Package
  addOrUpdatePackage: async (req, res) => {
    try {
      const {
        id,
        packageName,
        className,
        medium,
        mockTests,
        numberOfAttempts,
        platform,
        actualPrice,
        discountPrice,
        validityInDays,
        description,
        isActive
      } = req.body;

      const file = req.file;

      const image = file
        ? `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        : null;

      const result = await packageService.addOrUpdatePackage(
        {
          id,
          packageName,
          className,
          medium,
          mockTests,
          numberOfAttempts,
          platform,
          actualPrice,
          discountPrice,
          validityInDays,
          image,
          description,
          isActive
        },
        { filename: file?.filename, protocol: req.protocol, host: req.get('host') }
      );

      const message = id ? 'Package updated successfully' : 'Package added successfully';
      res.status(200).json({ message, package: result });

    } catch (error) {
      res.status(500).json({
        message: 'Failed to add/update package',
        error: error.message,
      });
    }
  },

  deletePackage: async (req, res) => {
    try {
      const { id } = req.params;
      await packageService.deletePackage(id);
      res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete package', error: error.message });
    }
  },


 getAllPackages : async (req, res) => {
  try {
    const packages = await Package.find()
      .populate({
        path: 'mockTests',
        populate: {
          path: 'questions',
          model: 'QuestionBank'
        }
      })
      .lean(); // use lean for better performance

    for (let pkg of packages) {
      for (let mockTest of pkg.mockTests) {

        // 🔁 If no questions are assigned, randomly fetch 3 per subject
        if (!mockTest.questions || mockTest.questions.length === 0) {
          mockTest.questions = [];

          for (let subjectId of mockTest.subjects) {
            const subjectQuestions = await QuestionBank.aggregate([
              {
                $match: {
                  subjectId: new mongoose.Types.ObjectId(subjectId),
                  status: 'active'
                }
              },
              { $sample: { size: 3 } }
            ]);

            mockTest.questions.push(...subjectQuestions);
          }
        }

        //  Attach subQuestions to Poem or Comprehensive questions
        for (let i = 0; i < mockTest.questions.length; i++) {
          const question = mockTest.questions[i];

          // If question has type and matches, fetch subQuestions
          if (question.typeOfQuestion === 'Poem' || question.typeOfQuestion === 'Comprehensive') {
            const subQuestions = await SubQuestion.find({ parentId: question._id }).lean();

            mockTest.questions[i] = {
              ...question,
              subQuestions
            };
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Packages with MockTests and Questions fetched successfully",
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching packages",
      error: error.message
    });
  }
},

 
// getPackageWithMockTests: async (req, res) => {
//     try {
//       const packageId = req.params.id;
//       const userId = req.user?.id || req.user?._id;

//       console.log("📥 Received packageId:", packageId);

//       if (!packageId || !mongoose.Types.ObjectId.isValid(packageId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid package ID format",
//         });
//       }

//       if (!userId) {
//         return res.status(401).json({
//           success: false,
//           message: "Unauthorized: user ID missing",
//         });
//       }

//       console.log("➡️ userId:", userId);
//       console.log("➡️ packageId (from params):", packageId);

//       const isPurchased = await Order.findOne({
//         userId: new mongoose.Types.ObjectId(userId),
//         'packages.packageId': new mongoose.Types.ObjectId(packageId),
//       });

//       console.log("📦 isPurchased result:", isPurchased);

//       if (!isPurchased) {
//         return res.status(403).json({
//           success: false,
//           message: "Access denied. Please purchase the package to view its content.",
//         });
//       }

//       const packageData = await Package.findById(packageId)
//         .populate({
//           path: 'mockTests',
//           populate: {
//             path: 'questions',
//             model: 'QuestionBank'
//           }
//         })
//         .lean();

//       if (!packageData) {
//         return res.status(404).json({
//           success: false,
//           message: "Package not found"
//         });
//       }

//       for (let mockTest of packageData.mockTests) {
//         if (!mockTest.questions || mockTest.questions.length === 0) {
//           mockTest.questions = [];

//           for (let subjectId of mockTest.subjects) {
//             const subjectQuestions = await QuestionBank.aggregate([
//               {
//                 $match: {
//                   subjectId: new mongoose.Types.ObjectId(subjectId),
//                   status: 'active'
//                 }
//               },
//               { $sample: { size: 3 } }
//             ]);

//             mockTest.questions.push(...subjectQuestions);
//           }
//         }

//         for (let i = 0; i < mockTest.questions.length; i++) {
//           const question = mockTest.questions[i];

//           if (question.typeOfQuestion === 'Poem' || question.typeOfQuestion === 'Comprehensive') {
//             const subQuestions = await SubQuestion.find({ parentId: question._id }).lean();

//             mockTest.questions[i] = {
//               ...question,
//               subQuestions
//             };
//           }
//         }
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Purchased package with mock tests and questions fetched successfully",
//         data: packageData
//       });

//     } catch (err) {
//       console.error("❌ Error fetching package with mock tests:", err);
//       res.status(500).json({
//         success: false,
//         message: "Server error",
//         error: err.message
//       });
//     }
//   },



  getPaginatedPackages: async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;

      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);

      if (isNaN(limitNum) || isNaN(offsetNum)) {
        return res.status(400).json({ message: 'Limit and offset must be valid numbers' });
      }

      const paginatedData = await packageService.getPaginatedPackages(limitNum, offsetNum);
      res.status(200).json(paginatedData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch packages', error: error.message });
    }
  },

  searchPackages: async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ message: 'Search query missing' });

      const results = await packageService.searchPackages(query);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error during search', error: error.message });
    }
  },

  deleteMultiplePackages: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty package IDs array' });
      }
      await packageService.deleteMultiplePackages(ids);
      res.status(200).json({ message: 'Packages deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete packages', error: error.message });
    }
  },

  getPackages: async (req, res) => {
  try {
    const { query = '', limit = 10, offset = 0 } = req.query;

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (isNaN(limitNum) || isNaN(offsetNum)) {
      return res.status(400).json({ message: 'Limit and offset must be valid numbers' });
    }

    const result = await packageService.getFilteredPaginatedPackages(query, limitNum, offsetNum);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch packages',
      error: error.message,
    });
  }
},
togglePackageStatus: async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Package ID is required' });
    }

    const result = await packageService.togglePackageStatus(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to toggle package status',
      error: error.message,
    });
  }
},



};

module.exports = packageController;