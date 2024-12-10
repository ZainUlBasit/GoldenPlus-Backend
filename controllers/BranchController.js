const Branch = require("../Models/Branch");
const Payment = require("../Models/Payment");
const Transaction = require("../Models/Transaction");
const User = require("../Models/User");
const { createError, successMessage } = require("../utils/ResponseMessage");
const bcrypt = require("bcrypt");

// Create a new branch
const testApi = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      customerId: "668ce559ba11e2d767038428",
    })
      .populate("customerId")
      .populate("items");

    const UpdatedTransactions = transactions
      .map((data) => {
        const date = new Date(data.date * 1000);
        const formattedDate = date.toISOString().split("T")[0];
        return {
          date: formattedDate,
          desc: `Sale - Invoice No - ${data.invoice_no}`,
          cr: data.total_amount,
          dr: 0,
        };
      })
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const Payload = {
      user_Id: "668ce559ba11e2d767038428",
      branch: 1,
    };
    let branchPayments;

    branchPayments = await Payment.find(Payload);

    branchPayments = branchPayments.map((bp) => {
      const date = new Date(bp.date * 1000);
      const formattedDate = date.toISOString().split("T")[0];
      return {
        date: formattedDate,
        desc: bp.desc,
        cr: 0,
        dr: bp.amount,
      };
    });

    return successMessage(
      res,
      [...UpdatedTransactions, ...branchPayments],
      "Transactions retrieved successfully!"
    );
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};
// Create a new branch
const createBranch = async (req, res) => {
  const { name, email, password, branch_number } = req.body;
  try {
    const user = await User.exists({ email });
    if (user) return createError(res, 409, "Email already registered");
    const branchNumberExist = await Branch.exists({ branch_number });
    if (branchNumberExist)
      return createError(res, 409, "Branch # already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    const branch = new Branch({
      name,
      email,
      branch_number,
    });
    await branch.save();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      branchId: branch._id,
      role: 2,
    });
    const isSaved = await newUser.save();
    if (!isSaved) return createError(res, 400, "Unable to add new user!");

    if (!branch) return createError(res, 400, "Unable to Create New Branch!");
    else return successMessage(res, branch, "New Branch Successfully Added!");
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Get all branches
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    return successMessage(
      res,
      branches,
      "Branches data successfully retreived!"
    );
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Get a single branch by ID
const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.status(200).json(branch);
  } catch (error) {
    return createError(res, 500, error.message);

    // res.status(500).json({ message: error.message });
  }
};

// Update a branch by ID
const updateBranch = async (req, res) => {
  const { branchId, payload } = req.body;
  console.log(req.body);
  //   return
  try {
    const userUpdate = await User.findOneAndUpdate(
      { branchId: branchId },
      {
        email: payload.email,
        name: payload.name,
      },
      {
        new: true,
      }
    );
    if (!userUpdate) {
      return createError(res, 404, "No Account attached with " + branchId);
    }

    const branch = await Branch.findByIdAndUpdate(branchId, payload, {
      new: true,
    });
    if (!branch) {
      return createError(res, 404, "No branch attached with " + branchId);
    }
    return successMessage(res, branch, "Branch successfully updated!");
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Delete a branch by ID
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.status(200).json({ message: "Branch deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  testApi,
};
