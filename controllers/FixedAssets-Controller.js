const FixedAsset = require("../Models/FixedAsset");
const { createError, successMessage } = require("../utils/responseUtils"); // Adjust the path as necessary

// Create a new fixed asset
const createFixedAsset = async (req, res) => {
  try {
    const { name, amount, branchId, branch_name } = req.body;
    const newFixedAsset = new FixedAsset({
      name,
      amount,
      branchId,
      branch_name,
    });

    await newFixedAsset.save();
    return successMessage(
      res,
      newFixedAsset,
      "Fixed asset created successfully"
    );
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Get all fixed assets
const getFixedAssets = async (req, res) => {
  const { id } = req.params;
  try {
    const fixedAssets = await FixedAsset.find({ branchId: id }).populate(
      "branchId"
    );
    return successMessage(
      res,
      fixedAssets,
      "Fixed assets retrieved successfully"
    );
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Get a single fixed asset by ID
const getFixedAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const fixedAsset = await FixedAsset.findById(id).populate("branchId");

    if (!fixedAsset) {
      return createError(res, 404, "Fixed asset not found");
    }

    return successMessage(
      res,
      fixedAsset,
      "Fixed asset retrieved successfully"
    );
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Update a fixed asset by ID
const updateFixedAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedFixedAsset = await FixedAsset.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedFixedAsset) {
      return createError(res, 404, "Fixed asset not found");
    }

    return successMessage(
      res,
      updatedFixedAsset,
      "Fixed asset updated successfully"
    );
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Update the amount of a fixed asset by ID
const updateAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return createError(res, 400, "Amount is required");
    }

    // Increment the amount by the value provided in the request body
    const updatedFixedAsset = await FixedAsset.findByIdAndUpdate(
      id,
      { $inc: { amount } }, // Using $inc to increment the amount
      { new: true, runValidators: true }
    );

    if (!updatedFixedAsset) {
      return createError(res, 404, "Fixed asset not found");
    }

    return successMessage(
      res,
      updatedFixedAsset,
      "Amount incremented successfully"
    );
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Delete a fixed asset by ID
const deleteFixedAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFixedAsset = await FixedAsset.findByIdAndDelete(id);

    if (!deletedFixedAsset) {
      return createError(res, 404, "Fixed asset not found");
    }

    return successMessage(res, null, "Fixed asset deleted successfully");
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

module.exports = {
  createFixedAsset,
  getFixedAssets,
  getFixedAssetById,
  updateFixedAsset,
  updateAmount,
  deleteFixedAsset,
};
