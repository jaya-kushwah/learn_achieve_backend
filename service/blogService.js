//   const Blog = require('../model/blogModel');
// exports.createBlog = async (data) => {
//   const newBlog = new Blog(data);
//   return await newBlog.save();
// };

// exports.getAllBlogs = async () => {
//   return await Blog.find().sort({ createdAt: -1 });
// };
const Blog = require('../model/blogModel');

exports.createBlog = async (data) => {
  const newBlog = new Blog(data);
  return await newBlog.save();
};

exports.updateBlog = async (id, data) => {
  return await Blog.findByIdAndUpdate(id, data, { new: true });
};

exports.getBlogById = async (id) => {
  return await Blog.findById(id);
};

exports.getAllBlogs = async () => {
  return await Blog.find().sort({ createdAt: -1 });
};
exports.deleteBlogById = async (id) => {
  return await Blog.findByIdAndDelete(id);
};

exports.deleteManyBlogs = async (ids) => {
  return await Blog.deleteMany({ _id: { $in: ids } });
};
