const { count } = require('console');
const Package = require('../model/Package');
const fs = require('fs');
const path = require('path');
const packageService = {




addOrUpdatePackage: async (data, file) => {
  const {
    id,
    packageName,
    className,
    medium,
    mockTests,
    numberOfAttempts,
    platform,
    actualPrice,
    discountPrice,
    validityInDays,
    image = '',
    description = '',
    isActive
  } = data;


  if (Number(numberOfAttempts) > 3) {
    throw new Error('Number of attempts cannot be more than 3');
  }

  const existing = await Package.findOne({ packageName: packageName.trim() });
  if (existing && (!id || existing._id.toString() !== id)) {
    throw new Error('Package with this name already exists');
  }

  const finalPrice = discountPrice < actualPrice ? discountPrice : actualPrice;

  if (id) {

    const pkg = await Package.findById(id);
    if (!pkg) throw new Error('Package not found');

    pkg.packageName = packageName;
    pkg.className = className;
    pkg.medium = medium;

    if (typeof mockTests === 'string') {
      pkg.mockTests = mockTests.split(',').map((m) => m.trim());
    } else if (Array.isArray(mockTests)) {
      pkg.mockTests = mockTests;
    }

    pkg.numberOfAttempts = numberOfAttempts;
    pkg.platform = platform;
    pkg.actualPrice = actualPrice;
    pkg.discountPrice = discountPrice;
    pkg.finalPrice = finalPrice;
    pkg.validityInDays = validityInDays;
    pkg.description = description;

    if (typeof isActive !== 'undefined') {
      pkg.isActive = String(isActive).toLowerCase() === 'true';
    }

    if (file) {
      if (pkg.image) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(pkg.image));
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Failed to delete old image:', err);
        });
      }

      pkg.image = `${file.protocol || 'http'}://${file.host || 'localhost:5000'}/uploads/${file.filename}`;
    }

    await pkg.save();
    return pkg;
  } else {
   
    const newPackage = new Package({
      packageName,
      className,
      medium,
      mockTests,
      numberOfAttempts,
      platform,
      actualPrice,
      discountPrice,
      finalPrice,
      validityInDays,
      image,
      description,
    });

    await newPackage.save();
    return newPackage;
  }
},




 deletePackage : async (id) => {
  const packageToDelete = await Package.findById(id);
  if (!packageToDelete) {
    throw new Error('Package not found');
  }

  if (packageToDelete.image) {
    const imagePath = path.resolve(packageToDelete.image);
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Failed to delete image:', err);
    });
  }

  await Package.findByIdAndDelete(id);
},


getAllPackages : async () => {
  const packages = await Package.find({ isActive: true }); //  only active packages

  const data = packages.map(pkg => {
    const availableMockTests = Array.isArray(pkg.mockTests) ? pkg.mockTests.length : 0;

    return {
      ...pkg.toObject(),
      availableMockTests, // count of associated mock tests
    };
  });

  return data;
},


updatePackage : async (id, updatedData, file) => {
  const pkg = await Package.findById(id);
  if (!pkg) throw new Error('Package not found');

  // Update simple fields if they exist in updatedData
  if (updatedData.packageName) pkg.packageName = updatedData.packageName;
  if (updatedData.className) pkg.className = updatedData.className;
  if (updatedData.medium) pkg.medium = updatedData.medium;

  if (updatedData.mockTests) {
    if (typeof updatedData.mockTests === 'string') {
      // convert comma separated string to array
      pkg.mockTests = updatedData.mockTests.split(',').map(item => item.trim());
    } else if (Array.isArray(updatedData.mockTests)) {
      pkg.mockTests = updatedData.mockTests;
    }
  }

  if (updatedData.numberOfAttempts) pkg.numberOfAttempts = updatedData.numberOfAttempts;
  if (updatedData.platform) pkg.platform = updatedData.platform;
  if (updatedData.actualPrice) pkg.actualPrice = updatedData.actualPrice;
  if (updatedData.discountPrice) pkg.discountPrice = updatedData.discountPrice;
  if (updatedData.validityInDays) pkg.validityInDays = updatedData.validityInDays;

  // Toggle active/deactive: updatedData.isActive can be boolean or string "true"/"false"
  if (typeof updatedData.isActive !== 'undefined') {
    if (typeof updatedData.isActive === 'string') {
      pkg.isActive = updatedData.isActive.toLowerCase() === 'true';
    } else {
      pkg.isActive = updatedData.isActive;
    }
  }

  if (file) {
  
    if (pkg.image) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(pkg.image));
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Failed to delete old image:', err);
      });
    }

    pkg.image = `${file.protocol || 'http'}://${file.host || 'localhost:5000'}/uploads/${file.filename}`;
  }

  await pkg.save();
  return pkg;
},
getPaginatedPackages: async (limit, offset) => {
  const total = await Package.countDocuments();
  const packages = await Package.find()
    .skip(offset)
    .limit(limit)
    .sort({ createdAt: -1 }); // keep this sorted version

  return {
    total,
    count: packages.length,
    packages,
    nextOffset: offset + limit < total ? offset + limit : null,
    prevOffset: offset - limit >= 0 ? offset - limit : null,
  };
},





 searchPackages : async (query) => {
  const trimmedQuery = query.trim();

  return await Package.find({
     packageName: { $regex: `^${trimmedQuery}`, $options: 'i' }// exact match, case-insensitive
  });
},


// const searchPackages = async (query) => {
//   const words = query.trim().split(/\s+/);

//   const regexArray = words.map(word => ({
//     packageName: { $regex: word, $options: 'i' },
//   }));

//   return await Package.find({ $and: regexArray });
// };

 deleteMultiplePackages : async (ids) => {
  const packages = await Package.find({ _id: { $in: ids } });

  for (const pkg of packages) {
    if (pkg.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', path.basename(pkg.image));
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }
  }

  await Package.deleteMany({ _id: { $in: ids } });
},



}

module.exports = packageService;
