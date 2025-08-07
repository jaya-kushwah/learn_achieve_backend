const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { verifyUserToken } = require('../middleware/userAuth');

router.post('/place-from-cart', verifyUserToken,orderController.placeOrderFromCart);
router.post('/place-selected',verifyUserToken, orderController.placeOrderWithSelectedPackages);

// router.get('/invoice/:orderId',verifyUserToken, orderController.getInvoiceByOrderId);
router.get('/myorders',verifyUserToken, orderController.getAllOrdersByUserId);

router.get('/ordered-packages', verifyUserToken,orderController.getOrderedPackagesWithDetails);


module.exports = router;