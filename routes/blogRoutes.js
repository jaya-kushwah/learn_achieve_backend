const express = require('express');
const router = express.Router();
const blogController = require('../controller/blogController');
const upload = require('../middleware/uploadBlog');
const { protect } = require('../middleware/authMiddleware');

router.post(
  '/add',
  protect,
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'mainImage', maxCount: 1 }
  ]),
  blogController.addOrUpdateBlog
);

router.get('/',protect, blogController.getBlogs);

router.delete('/delete', protect, blogController.deleteBlogHandler);



module.exports = router;

