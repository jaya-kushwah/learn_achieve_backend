const fs = require('fs');
const path = require('path');
const Package = require('../model/Package');

const packageService = {

  addOrUpdatePackage: async (data, file) => {
    const {
      id,
      packageName,
      className,
      SelectClass, 
      medium,
      mockTests,
      numberOfAttempts,
      platform,
      actualPrice,
      discountPrice,
      validityInDays,
      description = '',
      isActive,
    } = data;

    if (Number(numberOfAttempts) > 3) {
      throw new Error('Number of attempts cannot be more than 3');
    }

    const existing = await Package.findOne({ packageName: packageName.trim() });
    if (existing && (!id || existing._id.toString() !== id)) {
      throw new Error('Package with this name already exists');
    }

    const finalPrice = discountPrice < actualPrice ? discountPrice : actualPrice;
    const imagePath = file ? `uploads/${file.filename}` : '';

    if (id) {
      const pkg = await Package.findById(id);
      if (!pkg) throw new Error('Package not found');

      pkg.packageName = packageName;
      pkg.className = className;
      pkg.SelectClass = SelectClass; // added
      pkg.medium = medium;

pkg.mockTests = Array.isArray(mockTests)
  ? mockTests.map(id => id.trim())
  : mockTests.split(',').map(id => id.trim());


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
          const oldImage = path.join(__dirname, '..', 'uploads', path.basename(pkg.image));
          fs.unlink(oldImage, (err) => {
            if (err) console.error('Failed to delete old image:', err);
          });
        }
        pkg.image = imagePath;
      }

      await pkg.save();
      return pkg;
    } else {
      const newPackage = new Package({
        packageName,
        className,
        SelectClass, // added
        medium,
        mockTests: Array.isArray(mockTests)
          ? mockTests
          : mockTests.split(',').map((m) => m.trim()),
        numberOfAttempts,
        platform,
        actualPrice,
        discountPrice,
        finalPrice,
        validityInDays,
        image: imagePath,
        description,
        isActive: typeof isActive !== 'undefined'
          ? String(isActive).toLowerCase() === 'true'
          : true,
      });

      await newPackage.save();
      return newPackage;
    }
  },

  /**
   * Delete a Single Package
   */
  deletePackage: async (id) => {
    const pkg = await Package.findById(id);
    if (!pkg) throw new Error('Package not found');

    if (pkg.image) {
      const imagePath = path.resolve(pkg.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }

    await Package.findByIdAndDelete(id);
  },

  /**
   * Get All Active Packages with Count of Mock Tests
   */
  getAllPackages: async () => {
  const packages = await Package.find({ isActive: true }).populate('mockTests');


    return packages.map((pkg) => ({
      ...pkg.toObject(),
      availableMockTests: Array.isArray(pkg.mockTests) ? pkg.mockTests.length : 0,
    }));
  },

  /**
   * Update Package by ID
   */
  updatePackage: async (id, updatedData, file) => {
    const pkg = await Package.findById(id);
    if (!pkg) throw new Error('Package not found');

    const fields = [
      'packageName',
      'className',
      'SelectClass', // added
      'medium',
      'numberOfAttempts',
      'platform',
      'actualPrice',
      'discountPrice',
      'validityInDays',
      'description',
    ];

    fields.forEach(field => {
      if (updatedData[field]) pkg[field] = updatedData[field];
    });

  if (updatedData.mockTests) {
  pkg.mockTests = Array.isArray(updatedData.mockTests)
    ? updatedData.mockTests.map(id => id.trim())
    : updatedData.mockTests.split(',').map(id => id.trim());
}

    if (typeof updatedData.isActive !== 'undefined') {
      pkg.isActive = typeof updatedData.isActive === 'string'
        ? updatedData.isActive.toLowerCase() === 'true'
        : updatedData.isActive;
    }

    if (file) {
      if (pkg.image) {
        const oldImage = path.join(__dirname, '..', 'uploads', path.basename(pkg.image));
        fs.unlink(oldImage, (err) => {
          if (err) console.error('Failed to delete old image:', err);
        });
      }
      pkg.image = `uploads/${file.filename}`;
    }

    await pkg.save();
    return pkg;
  },

  /**
   * Get Paginated Packages
   */
  getPaginatedPackages: async (limit, offset) => {
    const total = await Package.countDocuments();
    const packages = await Package.find()
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      total,
      count: packages.length,
      packages,
      nextOffset: offset + limit < total ? offset + limit : null,
      prevOffset: offset - limit >= 0 ? offset - limit : null,
    };
  },

  /**
   * Search Packages by Name (Starts With)
   */
  searchPackages: async (query) => {
    return await Package.find({
      packageName: {
        $regex: `^${query.trim()}`,
        $options: 'i',
      },
    });
  },

  /**
   * Delete Multiple Packages
   */
  deleteMultiplePackages: async (ids) => {
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

  /**
   * Get Filtered Paginated Packages
   */
  getFilteredPaginatedPackages: async (searchQuery, limit, offset) => {
    const filter = {
      isActive: true,
    };

    if (searchQuery && searchQuery.trim() !== '') {
      filter.packageName = {
        $regex: `^${searchQuery.trim()}`,
        $options: 'i',
      };
    }

    const total = await Package.countDocuments(filter);

    const packages = await Package.find(filter)
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    const enriched = packages.map(pkg => ({
      ...pkg.toObject(),
      availableMockTests: Array.isArray(pkg.mockTests) ? pkg.mockTests.length : 0,
    }));

    return {
      total,
      count: enriched.length,
      packages: enriched,
      nextOffset: offset + limit < total ? offset + limit : null,
      prevOffset: offset - limit >= 0 ? offset - limit : null,
    };
  },

  /**
   * Toggle Package Active/Inactive
   */
  togglePackageStatus: async (id) => {
    const pkg = await Package.findById(id);
    if (!pkg) {
      throw new Error('Package not found');
    }

    pkg.isActive = !pkg.isActive;
    await pkg.save();

    return {
      message: `Package has been ${pkg.isActive ? 'activated' : 'deactivated'}`,
      package: pkg,
    };
  },
};

module.exports = packageService;