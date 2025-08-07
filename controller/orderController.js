const orderService = require('../service/orderService');
const crypto = require('crypto');
const Package = require('../model/Package');
const QuestionModel = require('../model/questionModel');
const QuestionBank = require('../model/questionModel');
const SubQuestion = require('../model/subQuestionModel');
const mongoose = require('mongoose');
const Order = require('../model/Order');
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

  // Get all orders by user ID
// getAllOrdersByUserId: async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const page = parseInt(req.query.page) || 1;  // Default to page 1
//     const limit = parseInt(req.query.limit) || 10; // Default limit to 10

//     if (!userId) {
//       return res.status(400).json({ message: 'User ID not found in request' });
//     }

//     const orders = await orderService.getAllOrdersByUserId(userId, page, limit);
//     res.status(200).json({ message: 'Orders fetched successfully', page, limit, orders });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// },
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
  

// getOrderedPackagesWithDetails: async (req, res) => {
//   try {
//     const orders = await Order.find().lean();

//     const packageToOrderMap = new Map(); // Map packageId -> orderId(s)

//     for (let order of orders) {
//       if (Array.isArray(order.packages)) {
//         for (let pkg of order.packages) {
//           if (pkg?.packageId) {
//             const key = pkg.packageId.toString();
//             if (!packageToOrderMap.has(key)) {
//               packageToOrderMap.set(key, []);
//             }
//             packageToOrderMap.get(key).push(order._id);
//           }
//         }
//       }
//     }

//     const uniquePackageIds = Array.from(packageToOrderMap.keys()).map(
//       (id) => new mongoose.Types.ObjectId(id)
//     );

//     const packages = await Package.find({ _id: { $in: uniquePackageIds } })
//       .populate({
//         path: 'mockTests',
//         populate: {
//           path: 'questions',
//           model: 'QuestionBank'
//         }
//       })
//       .lean();

//     // Add orderId and process mockTests
//     for (let pkg of packages) {
//       const pkgOrderIds = packageToOrderMap.get(pkg._id.toString()) || [];

//       for (let mockTest of pkg.mockTests) {
//         // Attach the first orderId (or all if needed)
//         mockTest.orderId = pkgOrderIds[0];

//         // Assign questions if none exist
//         if (!mockTest.questions || mockTest.questions.length === 0) {
//           mockTest.questions = [];

//           for (let subjectId of mockTest.subjects) {
//             const subjectQuestions = await QuestionBank.aggregate([
//               {
//                 $match: {
//                   subjectId: new mongoose.Types.ObjectId(subjectId),
//                   status: 'active',
//                 },
//               },
//               { $sample: { size: 3 } },
//             ]);

//             mockTest.questions.push(...subjectQuestions);
//           }
//         }

//         // Add subQuestions for Poem/Comprehensive
//         for (let i = 0; i < mockTest.questions.length; i++) {
//           const question = mockTest.questions[i];

//           if (
//             question.typeOfQuestion === 'Poem' ||
//             question.typeOfQuestion === 'Comprehensive'
//           ) {
//             const subQuestions = await SubQuestion.find({
//               parentId: question._id,
//             }).lean();

//             mockTest.questions[i] = {
//               ...question,
//               subQuestions,
//             };
//           }
//         }
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Ordered packages with MockTests and Questions fetched successfully',
//       data: packages,
//     });
//   } catch (error) {
//     console.error('Error in getOrderedPackagesWithDetails:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching ordered packages',
//       error: error.message,
//     });
//   }
// },





getOrderedPackagesWithDetails: async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).lean();

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        message: 'No ordered packages found for the user',
        data: [],
      });
    }

    const orderedPackages = [];

    for (const order of orders) {
      for (const pkg of order.packages) {
        const packageId = pkg.packageId;

        const fullPackage = await Package.findById(packageId)
          .populate({
            path: 'mockTests',
            populate: {
              path: 'questions',
            },
          })
          .lean();

        if (fullPackage) {
          // Now manually handle missing questions
          for (let mockTest of fullPackage.mockTests) {
            // Attach orderId
            mockTest.orderId = order._id;

            // If no questions, fetch based on subjects
            if (!mockTest.questions || mockTest.questions.length === 0) {
              mockTest.questions = [];

              for (let subjectId of mockTest.subjects) {
                const subjectQuestions = await QuestionBank.aggregate([
                  {
                    $match: {
                      subjectId: new mongoose.Types.ObjectId(subjectId),
                      status: 'active',
                    },
                  },
                  { $sample: { size: 3 } },
                ]);

                mockTest.questions.push(...subjectQuestions);
              }
            }

            // Add subQuestions for Poem/Comprehensive
            for (let i = 0; i < mockTest.questions.length; i++) {
              const question = mockTest.questions[i];

              if (
                question.typeOfQuestion === 'Poem' ||
                question.typeOfQuestion === 'Comprehensive'
              ) {
                const subQuestions = await SubQuestion.find({
                  parentId: question._id,
                }).lean();

                mockTest.questions[i] = {
                  ...question,
                  subQuestions,
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
      message: 'Ordered packages with MockTests and Questions fetched successfully',
      data: orderedPackages,
    });
  } catch (err) {
    console.error('Error in getOrderedPackagesWithDetails:', err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message,
    });
  }
}




};


module.exports = orderController;