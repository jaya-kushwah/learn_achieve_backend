const Cart = require('../model/Cart');
const Package = require('../model/Package');
const Order = require('../model/Order');
const moment = require('moment');
const crypto = require('crypto');
const placeOrderFromCart = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('packages.packageId');
  if (!cart || cart.packages.length === 0) {
    throw new Error('Cart is empty');
  }

  const orderPackages = cart.packages.map(item => {
    const pkg = item.packageId;
    const finalPrice = pkg.finalPrice || 0;
    const discount = pkg.discountPrice || 0;
    const originalPrice = finalPrice + discount;

    return {
      packageId: pkg._id,
      quantity: item.quantity || 1,
      priceAtOrder: finalPrice,
      discountAtOrder: discount,
      originalPrice
    };
  });

  const totalAmount = orderPackages.reduce((sum, item) =>
    sum + (item.quantity * item.priceAtOrder), 0
  );

  const discountAmt = orderPackages.reduce((sum, item) =>
    sum + (item.quantity * item.discountAtOrder), 0
  );

  const order = new Order({
    userId,
    packages: orderPackages,
    totalAmount,
    discountAmt
  });

  await order.save();
  await Cart.deleteOne({ _id: cart._id }); // Clear cart

  return order;
};

const placeOrderWithSelectedPackages = async (userId, packageIds) => {
  const packages = await Package.find({ _id: { $in: packageIds } });
  if (packages.length === 0) throw new Error('No valid packages found');

  const orderPackages = packages.map(pkg => {
    const finalPrice = pkg.finalPrice || 0;
    const discount = pkg.discountPrice || 0;
    const originalPrice = finalPrice + discount;

    return {
      packageId: pkg._id,
      quantity: 1,
      priceAtOrder: finalPrice,
      discountAtOrder: discount,
      originalPrice
    };
  });

  const totalAmount = orderPackages.reduce((sum, item) =>
    sum + (item.quantity * item.priceAtOrder), 0
  );

  const discountAmt = orderPackages.reduce((sum, item) =>
    sum + (item.quantity * item.discountAtOrder), 0
  );

  const order = new Order({
    userId,
    packages: orderPackages,
    totalAmount,
    discountAmt
  });

  await order.save();

  await Cart.updateOne(
    { userId },
    { $pull: { packages: { packageId: { $in: packageIds } } } }
  );

  return order;
};

const getInvoiceByOrderId = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('packages.packageId')
    .populate('userId');

  if (!order) throw new Error('Order not found');

  const packages = order.packages.map(item => {
    const pkg = item.packageId;
    return {
      name: pkg.packageName,
      medium: pkg.medium,
      price: item.originalPrice,
      quantity: item.quantity,
      discount: item.discountAtOrder,
      finalPrice: item.priceAtOrder,
      total: item.priceAtOrder * item.quantity
    };
  });

  const itemTotal = packages.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discountAmt || 0;
  const grandTotal = order.totalAmount;

  const formattedOrderId = `ORD-${moment(order.createdAt).format('YYYYMMDD')}-${order._id.toString().slice(-6).toUpperCase()}`;

  const invoice = {
    orderId: formattedOrderId,
    orderDate: moment(order.createdAt).format('DD/MM/YYYY'),
    userId: order.userId._id,
    billingAddress: order.userId.address || 'Madhya Pradesh, India',
    shippingAddress: order.userId.address || 'Madhya Pradesh, India',
    company: {
      name: "Pradnya Learn and Achieve Pvt Ltd.",
      gstin: "27AAOCP3526D1ZE",
      cin: "U85499MH2023PTC416277"
    },
    packages,
    itemTotal,
    discount,
    grandTotal
  };

  return invoice;
};
// const getAllOrdersByUserId = async (userId) => {
//   const orders = await Order.find({ userId })
//     .populate('packages.packageId')
//     .sort({ createdAt: -1 });

//   const formattedOrders = orders.map((order, index) => {
//     const formattedOrderId = `ORD-${moment(order.createdAt).format('YYYYMMDD')}-${order._id.toString().slice(-6).toUpperCase()}`;

//     // Transaction ID (Random, persistent in memory)
//     const transactionId = `TXN-${moment(order.createdAt).format('YYYYMMDD')}-${crypto.randomBytes(5).toString('hex')}`;

//     return {
//       srNo: index + 1,
//       orderId: formattedOrderId,
//       packageName: order.packages[0]?.packageId?.packageName || 'N/A',
//       dateTime: moment(order.createdAt).format('DD MMM, YYYY'),
//       transactionId,
//       amount: order.totalAmount,
//       invoice: "" // or your frontend route
//     };
//   });

//   return formattedOrders;
// };
const getAllOrdersByUserId = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // 1. Get total count
  const availableCount = await Order.countDocuments({ userId });

  // 2. Fetch paginated orders
  const orders = await Order.find({ userId })
    .populate('packages.packageId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // 3. Format orders
  const formattedOrders = orders.map((order, index) => {
    const formattedOrderId = `ORD-${moment(order.createdAt).format('YYYYMMDD')}-${order._id.toString().slice(-6).toUpperCase()}`;
    const transactionId = `TXN-${moment(order.createdAt).format('YYYYMMDD')}-${crypto.randomBytes(5).toString('hex')}`;

    return {
      srNo: skip + index + 1,
      orderId: formattedOrderId,
      _id: order._id,
      packageName: order.packages[0]?.packageId?.packageName || 'N/A',
      dateTime: moment(order.createdAt).format('DD MMM, YYYY'),
      transactionId,
      amount: order.totalAmount,
      invoice: ""
    };
  });

  return {
    orders: formattedOrders,
    availableCount
  };
};

module.exports = {
  placeOrderFromCart,
  placeOrderWithSelectedPackages,
  getInvoiceByOrderId,
  getAllOrdersByUserId
};