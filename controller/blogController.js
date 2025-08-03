const blogService = require('../service/blogService');
const Blog = require('../model/blogModel'); 

exports.addOrUpdateBlog = async (req, res) => {
  try {
    const {
      id, category, authorName, date, title, briefIntro, details
    } = req.body;

    const featuredImage = req.files?.featuredImage?.[0]?.filename;
    const mainImage = req.files?.mainImage?.[0]?.filename;

    let blogData = {
      category,
      authorName,
      date,
      title,
      briefIntro,
      details,
    };

    // CREATE
    if (!id) {
      if (!featuredImage || !mainImage) {
        return res.status(400).json({ message: 'Both images are required for new blog' });
      }

      blogData.featuredImage = featuredImage;
      blogData.mainImage = mainImage;

      const newBlog = await blogService.createBlog(blogData);
      return res.status(201).json({ message: 'Blog created successfully', data: newBlog });
    }

    // UPDATE
    const existingBlog = await blogService.getBlogById(id);
    if (!existingBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Use new images if provided, else keep existing
    blogData.featuredImage = featuredImage || existingBlog.featuredImage;
    blogData.mainImage = mainImage || existingBlog.mainImage;

    const updatedBlog = await blogService.updateBlog(id, blogData);
    res.status(200).json({ message: 'Blog updated successfully', data: updatedBlog });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteBlogHandler = async (req, res) => {
  try {
    let { ids } = req.body;

    if (!ids) {
      return res.status(400).json({ message: 'No blog ID(s) provided' });
    }

    // If ids is a string, convert it to an array
    if (typeof ids === 'string') {
      ids = [ids];
    }

    // Validate each id
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: 'Invalid blog ID(s)', invalidIds });
    }

    const result = await Blog.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      message: `${result.deletedCount} blog(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete Blog Error:', error);
    return res.status(500).json({ message: 'Server error while deleting blogs' });
  }
};
