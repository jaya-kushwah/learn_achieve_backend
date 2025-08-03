const cartService = require('../service/cartService');

const cartController = {
  addToCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { packageId } = req.body;

      const cart = await cartService.addToCart(userId, packageId);
      res.status(200).json({ message: 'Package added to cart', cart });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getUserCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const packages = await cartService.getUserCart(userId);
      res.status(200).json(packages);

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

 removeFromCart: async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageId } = req.params;

    const cart = await cartService.removeFromCart(userId, packageId);

    if (!cart) {
      return res.status(200).json({ message: 'Cart is now empty and has been deleted' });
    }

    res.status(200).json({ message: 'Package removed from cart', cart });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
},


  removeMultipleFromCart: async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageIds } = req.body; 

    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      return res.status(400).json({ message: 'packageIds array is required' });
    }

    const cart = await cartService.removeMultipleFromCart(userId, packageIds);
    res.status(200).json({ message: 'Selected packages removed from cart', cart });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
  
};




module.exports = cartController;
