const Cart = require('../model/Cart');
const Package = require('../model/Package');
const Order = require('../model/Order');

const placeOrderFromCart = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('packages.packageId');
  if (!cart || cart.packages.length === 0) {
    throw new Error('Cart is empty');
  }

  const orderPackages = cart.packages.map(item => ({
    packageId: item.packageId._id,
    quantity: item.quantity || 1,
    priceAtOrder: item.packageId.finalPrice
  }));

  const totalAmount = orderPackages.reduce((sum, item) =>
    sum + (item.quantity * item.priceAtOrder), 0
  );

  const order = new Order({
    userId,
    packages: orderPackages,
    totalAmount
  });

  await order.save();
  await Cart.deleteOne({ _id: cart._id }); // Clear cart

  return order;
};


const placeOrderWithSelectedPackages = async (userId, packageIds) => {
  const packages = await Package.find({ _id: { $in: packageIds } });
  if (packages.length === 0) throw new Error('No valid packages found');

  const orderPackages = packages.map(pkg => ({
    packageId: pkg._id,
    quantity: 1,
    priceAtOrder: pkg.finalPrice
  }));

  const totalAmount = orderPackages.reduce((sum, item) =>
    sum + (item.quantity * item.priceAtOrder), 0
  );

  const order = new Order({
    userId,
    packages: orderPackages,
    totalAmount
  });

  await order.save();

  // 🧹 Cart se selected packages ko hata do
  await Cart.updateOne(
    { userId },
    { $pull: { packages: { packageId: { $in: packageIds } } } }
  );

  return order;
};

const getInvoiceByOrderId = async (orderId) => {
  const order = await Order.findById(orderId).populate('packages.packageId');
  if (!order) throw new Error('Order not found');

  const invoice = {
    orderId: order._id,
    userId: order.userId,
    packages: order.packages.map(item => ({
      name: item.packageId.packageName,
      medium: item.packageId.medium,
      price: item.priceAtOrder,
      quantity: item.quantity,
      total: item.priceAtOrder * item.quantity
    })),
    totalAmount: order.totalAmount
  };

  return invoice;
};


module.exports = {
  placeOrderFromCart,
  placeOrderWithSelectedPackages,
  getInvoiceByOrderId
};
