const packageService = require('../service/packageService');

const packageController = {
  // ✅ Unified Add/Update Package
  addOrUpdatePackage: async (req, res) => {
    try {
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
        description,
        isActive
      } = req.body;

      const file = req.file;

      const image = file
        ? `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        : null;

      const result = await packageService.addOrUpdatePackage(
        {
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
          image,
          description,
          isActive
        },
        { filename: file?.filename, protocol: req.protocol, host: req.get('host') }
      );

      const message = id ? 'Package updated successfully' : 'Package added successfully';
      res.status(200).json({ message, package: result });

    } catch (error) {
      res.status(500).json({
        message: 'Failed to add/update package',
        error: error.message,
      });
    }
  },

  deletePackage: async (req, res) => {
    try {
      const { id } = req.params;
      await packageService.deletePackage(id);
      res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete package', error: error.message });
    }
  },

  getAllPackages: async (req, res) => {
    try {
      const all = await packageService.getAllPackages();
      res.status(200).json(all);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching packages', error: err.message });
    }
  },

  getPaginatedPackages: async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;

      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);

      if (isNaN(limitNum) || isNaN(offsetNum)) {
        return res.status(400).json({ message: 'Limit and offset must be valid numbers' });
      }

      const paginatedData = await packageService.getPaginatedPackages(limitNum, offsetNum);
      res.status(200).json(paginatedData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch packages', error: error.message });
    }
  },

  searchPackages: async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ message: 'Search query missing' });

      const results = await packageService.searchPackages(query);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error during search', error: error.message });
    }
  },

  deleteMultiplePackages: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty package IDs array' });
      }
      await packageService.deleteMultiplePackages(ids);
      res.status(200).json({ message: 'Packages deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete packages', error: error.message });
    }
  },
};

module.exports = packageController;
