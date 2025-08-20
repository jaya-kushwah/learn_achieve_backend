const orderService = require('../service/orderService');
const crypto = require('crypto');
const Package = require('../model/Package');
const QuestionModel = require('../model/questionModel');
const QuestionBank = require('../model/questionModel');
const SubQuestion = require('../model/subQuestionModel');
const mongoose = require('mongoose');
const Order = require('../model/Order');
const Subject = require("../model/subjectModel");
const ClassModel = require('../model/classMasterModel');
const orderController = {
  //  Place order from cart
  placeOrderFromCart: async (req, res) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in request' });
      }

      const order = await orderService.placeOrderFromCart(userId);
      res.status(201).json({ message: 'Order placed from cart successfully', order });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

getAllOrdersByUserId: async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }

    const { orders, availableCount } = await orderService.getAllOrdersByUserId(userId, page, limit);

    res.status(200).json({
      message: 'Orders fetched successfully',
      page,
      limit,
      availableCount, //  Total number of user orders
      orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},


  //  Place order with selected packageIds
  placeOrderWithSelectedPackages: async (req, res) => {
    try {
      const userId = req.user.id;
      let { packageIds } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in request' });
      }

      if (!packageIds || !Array.isArray(packageIds)) {
        return res.status(400).json({ message: 'packageIds must be a non-empty array' });
      }

      const order = await orderService.placeOrderWithSelectedPackages(userId, packageIds);
      res.status(200).json({ message: 'Order placed successfully', order });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Get invoice by order ID
  getInvoiceByOrderId: async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required in params' });
      }

      const invoice = await orderService.getInvoiceByOrderId(orderId);
      res.status(200).json({ message: 'Invoice generated successfully', invoice });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

 
// getOrderedPackagesWithDetails : async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log("User ID:", userId);

//     const orders = await Order.find({ userId }).lean();

//     if (!orders.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No ordered packages found for the user",
//         data: [],
//       });
//     }

//     const orderedPackages = [];

//     for (const order of orders) {
//       for (const pkg of order.packages) {
//         const packageId = pkg.packageId;

//         const fullPackage = await Package.findById(packageId)
//           .populate({
//             path: "mockTests",
//             populate: {
//               path: "questions",
//               strictPopulate: false, 
//             },
//           })
//           .lean();

//         if (fullPackage) {
//           for (let mockTest of fullPackage.mockTests) {
//             mockTest.orderId = order._id;

//             if (!mockTest.questions || mockTest.questions.length === 0) {
//               mockTest.questions = [];
//               for (let subjectId of mockTest.subjects) {
//                 const subjectQuestions = await QuestionBank.aggregate([
//                   {
//                     $match: {
//                       subjectId: new mongoose.Types.ObjectId(subjectId),
//                       status: "active",
//                     },
//                   },
//                   { $sample: { size: 3 } },
//                 ]);
//                 mockTest.questions.push(...subjectQuestions);
//               }
//             }

//             // SubQuestions attach करो
//             for (let i = 0; i < mockTest.questions.length; i++) {
//               const question = mockTest.questions[i];
//               if (
//                 question.typeOfQuestion === "Poem" ||
//                 question.typeOfQuestion === "Comprehensive"
//               ) {
//                 const subQuestions = await SubQuestion.find({
//                   parentId: question._id,
//                 }).lean();
//                 mockTest.questions[i] = {
//                   ...question,
//                   subQuestions,
//                 };
//               }
//             }
//           }
//           orderedPackages.push(fullPackage);
//         }
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Ordered packages with MockTests and Questions fetched successfully",
//       data: orderedPackages,
//     });
//   } catch (err) {
//     console.error("Error in getOrderedPackagesWithDetails:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// }


// getOrderedPackagesWithDetails : async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const orders = await Order.find({ userId }).lean();

//     if (!orders.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No ordered packages found for the user",
//         data: [],
//       });
//     }

//     const orderedPackages = [];

//     for (const order of orders) {
//       for (const pkg of order.packages) {
//         const packageId = pkg.packageId;

//         const fullPackage = await Package.findById(packageId)
//           .populate({
//             path: "mockTests",
//             populate: [
//               { path: "questions" },
//               { path: "subjects", select: "_id subject image color status" }, // ✅ Subject name भी मिलेगा
//             ],
//           })
//           .lean();

//         if (fullPackage) {
//           for (let mockTest of fullPackage.mockTests) {
//             // OrderId attach कर दो
//             mockTest.orderId = order._id;

//             // अगर questions नहीं हैं तो subjects से random pick करो
//             if (!mockTest.questions || mockTest.questions.length === 0) {
//               mockTest.questions = [];

//               for (let subject of mockTest.subjects) {
//                 let subjectId = subject?._id || subject;

//                 // Safe conversion to ObjectId
//                 if (
//                   subjectId &&
//                   !(subjectId instanceof mongoose.Types.ObjectId)
//                 ) {
//                   try {
//                     subjectId = new mongoose.Types.ObjectId(subjectId);
//                   } catch (err) {
//                     console.error("❌ Invalid subjectId skipped:", subjectId);
//                     continue;
//                   }
//                 }

//                 if (!subjectId) continue;

//                 const subjectQuestions = await QuestionBank.aggregate([
//                   {
//                     $match: {
//                       subjectId: subjectId,
//                       status: "active",
//                     },
//                   },
//                   { $sample: { size: 3 } }, // random 3 questions
//                 ]);

//                 mockTest.questions.push(...subjectQuestions);
//               }
//             }

//             // Poem/Comprehensive के लिए subQuestions attach
//             for (let i = 0; i < mockTest.questions.length; i++) {
//               const question = mockTest.questions[i];

//               if (
//                 question.typeOfQuestion === "Poem" ||
//                 question.typeOfQuestion === "Comprehensive"
//               ) {
//                 const subQuestions = await SubQuestion.find({
//                   parentId: question._id,
//                 }).lean();

//                 mockTest.questions[i] = {
//                   ...question,
//                   subQuestions,
//                 };
//               }
//             }
//           }

//           orderedPackages.push(fullPackage);
//         }
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Ordered packages with MockTests, Subjects and Questions fetched successfully",
//       data: orderedPackages,
//     });
//   } catch (err) {
//     console.error("Error in getOrderedPackagesWithDetails:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });

//   }}


getOrderedPackagesWithDetails: async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User ID:", userId);

    const orders = await Order.find({ userId }).lean();

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        message: "No ordered packages found for the user",
        data: [],
      });
    }

    const orderedPackages = [];

    for (const order of orders) {
      for (const pkg of order.packages) {
        const packageId = pkg.packageId;

        const fullPackage = await Package.findById(packageId)
          .populate({
            path: "mockTests",
            populate: [
              {
                path: "questions",
                strictPopulate: false,
              },
              {
                path: "subjects",
                select: "_id subject", // only send id & subject name
              },
            ],
          })
          .lean();

        if (fullPackage) {
          for (let mockTest of fullPackage.mockTests) {
            mockTest.orderId = order._id;

            // ✅ Safely handle subjects array (objects or ObjectIds)
            if (!mockTest.questions || mockTest.questions.length === 0) {
              mockTest.questions = [];

              for (let subject of mockTest.subjects || []) {
                const subjectId =
                  typeof subject === "object" && subject._id
                    ? subject._id
                    : subject;

                if (!subjectId) continue;

                const subjectQuestions = await QuestionBank.aggregate([
                  {
                    $match: {
                      // subjectId: new mongoose.Types.ObjectId(subjectId),
                      status: "active",
                    },
                  },
                  { $sample: { size: 3 } },
                ]);

                mockTest.questions.push(...subjectQuestions);
              }
            }

            // Attach subQuestions as IDs only
            for (let i = 0; i < mockTest.questions.length; i++) {
              const question = mockTest.questions[i];
              if (
                question.typeOfQuestion === "Poem" ||
                question.typeOfQuestion === "Comprehensive"
              ) {
                const subQuestions = await SubQuestion.find({
                  parentId: question._id,
                })
                  .select("_id") // only fetch IDs
                  .lean();

                const subQuestionIds = subQuestions.map((sq) => sq._id);

                mockTest.questions[i] = {
                  ...question,
                  subQuestions: subQuestionIds, // attach only IDs
                };
              }
            }
          }

          orderedPackages.push(fullPackage);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Ordered packages with MockTests, Questions & Subjects fetched successfully",
      data: orderedPackages,
    });
  } catch (err) {
    console.error("Error in getOrderedPackagesWithDetails:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}


// getOrderedPackagesWithDetails: async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log("User ID:", userId);

//     const orders = await Order.find({ userId }).lean();

//     if (!orders.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No ordered packages found for the user",
//         data: [],
//       });
//     }

//     const orderedPackages = [];

//     for (const order of orders) {
//       for (const pkg of order.packages) {
//         const packageId = pkg.packageId;

//         const fullPackage = await Package.findById(packageId)
//           .populate({
//             path: "mockTests",
//             populate: [
//               {
//                 path: "questions",
//                 strictPopulate: false,
//               },
//               {
//                 path: "subjects",
//                 select: "_id subject", // only send id & subject name
//               },
//             ],
//           })
//           .lean();

//         if (fullPackage) {
//           for (let mockTest of fullPackage.mockTests) {
//             mockTest.orderId = order._id;

//             // ✅ Safely handle subjects array (objects or ObjectIds)
//             if (!mockTest.questions || mockTest.questions.length === 0) {
//               mockTest.questions = [];

//               for (let subject of mockTest.subjects || []) {
//                 const subjectId =
//                   typeof subject === "object" && subject._id
//                     ? subject._id
//                     : subject;

//                 if (!subjectId) continue; // skip if no id

//                 const subjectQuestions = await QuestionBank.aggregate([
//                   {
//                     $match: {
//                       // subjectId: new mongoose.Types.ObjectId(subjectId),
//                       status: "active",
//                     },
//                   },
//                   { $sample: { size: 3 } },
//                 ]);

//                 mockTest.questions.push(...subjectQuestions);
//               }
//             }

//             // Attach subQuestions
//             for (let i = 0; i < mockTest.questions.length; i++) {
//               const question = mockTest.questions[i];
//               if (
//                 question.typeOfQuestion === "Poem" ||
//                 question.typeOfQuestion === "Comprehensive"
//               ) {
//                 const subQuestions = await SubQuestion.find({
//                   parentId: question._id,
//                 }).lean();
//                 mockTest.questions[i] = {
//                   ...question,
//                   subQuestions,
//                 };
//               }
//             }
//           }

//           orderedPackages.push(fullPackage);
//         }
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Ordered packages with MockTests, Questions & Subjects fetched successfully",
//       data: orderedPackages,
//     });
//   } catch (err) {
//     console.error("Error in getOrderedPackagesWithDetails:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// }


};

module.exports = orderController;