const Cart = require('../model/Cart');
const Package = require('../model/Package');


const addToCart = async (userId, packageId) => {
  const pkg = await Package.findById(packageId);
  if (!pkg) throw new Error('Package not found');

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, packages: [] });
  }


  const existingItem = cart.packages.find(p => p.packageId.equals(packageId));
  if (existingItem) {
    throw new Error('Package already in cart');
  }

  cart.packages.push({ packageId, quantity: 1 });

  await cart.save();
  return cart;
};



const getUserCart = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('packages.packageId');
  if (!cart) return [];

  const detailedPackages = cart.packages.map(item => {
    const pkg = item.packageId;
    return {
      packageId: pkg._id,
      name: pkg.name,
      finalPrice: pkg.finalPrice,
      quantity: item.quantity,
      totalPrice: item.quantity * pkg.finalPrice
    };
  });

  return detailedPackages;
};


const removeFromCart = async (userId, packageId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error('Cart not found');

  const index = cart.packages.findIndex(p => p.packageId.equals(packageId));
  if (index === -1) throw new Error('Package not in cart');

  if (cart.packages[index].quantity > 1) {
    cart.packages[index].quantity -= 1;
    await cart.save();
    return cart;
  } else {
    cart.packages.splice(index, 1);

    if (cart.packages.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return null;
    } else {
      await cart.save();
      return cart;
    }
  }
};


const removeMultipleFromCart = async (userId, packageIds) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error('Cart not found');

  cart.packages = cart.packages.filter(
    item => !packageIds.some(id => item.packageId.equals(id))
  );

  await cart.save();
  return cart;
};

module.exports = {
  addToCart,
  getUserCart,
  removeFromCart,
  removeMultipleFromCart
};
