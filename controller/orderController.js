const orderService = require('../service/orderService');

const orderController = {
  placeOrderFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const order = await orderService.placeOrderFromCart(userId);
      res.status(201).json({ message: 'Order placed from cart', order });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
 placeOrderWithSelectedPackages: async (req, res) => {
    try {
      const userId = req.user.id;
      let { packageIds } = req.body;
      if (!packageIds) {
        return res.status(400).json({ message: 'packageIds array is required' });
      }

      // Agar ek hi packageId form-urlencoded mein aaye to use array bana do
      if (!Array.isArray(packageIds)) {
        packageIds = [packageIds];
      }

      const order = await orderService.placeOrderWithSelectedPackages(userId, packageIds);
      res.status(200).json({ message: 'Order placed successfully', order });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

   getInvoiceByOrderId : async (req, res) => {
  try {
    const { orderId } = req.params;

    const invoice = await orderService.getInvoiceByOrderId(orderId);
    res.status(200).json({ message: 'Invoice generated successfully', invoice });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
   }
};

module.exports = orderController;
