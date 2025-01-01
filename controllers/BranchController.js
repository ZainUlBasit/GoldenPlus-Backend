const Account = require("../Models/Account");
const Branch = require("../Models/Branch");
const Company = require("../Models/Company");
const Customer = require("../Models/Customer");
const Payment = require("../Models/Payment");
const RawMaterialStock = require("../Models/RawMaterialStock");
const Stock = require("../Models/Stock");
const Transaction = require("../Models/Transaction");
const User = require("../Models/User");
const { createError, successMessage } = require("../utils/ResponseMessage");
const bcrypt = require("bcrypt");

// Create a new branch
const getCustomerLedger = async (req, res) => {
  const { id } = req.params;
  try {
    let customers = await Customer.findById(id);
    if (!customers)
      return createError(res, 404, "No Customer Found with id: " + id);

    let OpeningBalance = customers.opening_balance;

    const transactions = await Transaction.find({
      customerId: id,
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
          dr: data.total_amount,
          cr: 0,
          type: 1, // 1: Sales 2: Payments
          color: "!text-[green]",
        };
      })
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let branchPayments;

    branchPayments = await Payment.find({
      user_Id: id,
    });

    branchPayments = branchPayments.map((bp) => {
      const date = new Date(bp.date * 1000);
      const formattedDate = date.toISOString().split("T")[0];
      return {
        date: formattedDate,
        desc: bp.desc,
        dr: 0,
        cr: bp.amount,
        type: 2, // 1: Sales 2: Payments
      };
    });

    const ledger_data = [...UpdatedTransactions, ...branchPayments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const final_ledger = ledger_data.map((LD) => {
      OpeningBalance =
        LD.type === 1 ? OpeningBalance + LD.dr : OpeningBalance - LD.cr;
      return {
        ...LD,
        date: Math.floor(new Date(LD.date) / 1000),
        bal: OpeningBalance,
      };
    });

    return successMessage(
      res,
      {
        customer: customers,
        ledger: final_ledger,
        closing_balance: OpeningBalance,
      },
      "Transactions retrieved successfully!"
    );
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

const getCashStats = async (req, res, next) => {
  const {
    branch,
    startDate = 0,
    endDate = Math.floor(Date.now() / 1000),
  } = req.body;
  console.log(req.body);

  let branchPayments;
  try {
    const currentBranch =
      branch === 1
        ? "Golden Plus PCU"
        : branch === 2
        ? "Anmol PCU"
        : "Green Way PCU";
    const accounts = await Account.findOne({ branch_name: currentBranch });
    if (!accounts) {
      throw new Error("Branch doesn't have an account");
    }

    let OpeningBalance = accounts.opening_balance;

    const Payload = {
      branch: 2,
      date: {
        $gte: Math.floor(new Date(startDate) / 1000),
        $lte: Math.floor(new Date(endDate) / 1000),
      },
    };

    branchPayments = await Payment.find(Payload).sort({ date: 1 });
    // console.log(branchPayments);

    const updatedPayments = await branchPayments.map((py) => {
      const date = new Date(py.date * 1000);
      const formattedDate = date.toISOString().split("T")[0];
      // console.log(py.user_type);

      if (py.user_type === 1) {
        return {
          date: formattedDate,
          desc: py.desc,
          dr: 0,
          cr: py.amount,
          type: 2, // 1: Supplier 2: Customer
        };
      } else {
        return {
          date: formattedDate,
          desc: py.desc,
          dr: py.amount,
          cr: 0,
          type: 1, // 1: Supplier 2: Customer
        };
      }
    });

    const final_cash_stats = updatedPayments.map((LD) => {
      if (LD.type === 2) {
        OpeningBalance -= LD.cr;
      }

      if (LD.type === 1) {
        OpeningBalance += LD.dr;
      }
      return {
        ...LD,
        date: Math.floor(new Date(LD.date) / 1000),
        bal: OpeningBalance,
      };
    });

    console.log(final_cash_stats);

    if (!final_cash_stats) {
      return createError(res, 404, "Payments record not found for branch!");
    } else {
      return successMessage(res, final_cash_stats, null);
    }
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const SupplieLedger = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    let company = await Company.findById(id);
    if (!company)
      return createError(res, 404, "No Supplier Found with id: " + id);
    console.log(company);

    let OpeningBalance = company.opening_balance;

    let stocksStats = await RawMaterialStock.find({
      supplierId: id,
    }).populate("branchId");

    stocksStats = stocksStats.map((bp) => {
      const date = new Date(bp.date * 1000);
      const formattedDate = date.toISOString().split("T")[0];
      return {
        date: formattedDate,
        desc: bp.desc,
        dr: 0,
        cr: bp.total_amount,
        type: 2, // 1: Sales 2: Payments
      };
    });
    console.log("stats:", stocksStats);

    let branchPayments;

    branchPayments = await Payment.find({
      user_type: 1,
      user_Id: id,
    });

    branchPayments = branchPayments.map((bp) => {
      const date = new Date(bp.date * 1000);
      const formattedDate = date.toISOString().split("T")[0];
      return {
        date: formattedDate,
        desc: bp.desc,
        dr: bp.amount,
        cr: 0,
        type: 1, // 1: Sales 2: Payments
      };
    });

    const ledger_data = [...stocksStats, ...branchPayments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const final_ledger = ledger_data.map((LD) => {
      OpeningBalance =
        LD.type === 1 ? OpeningBalance - LD.dr : OpeningBalance + LD.cr;
      return {
        ...LD,
        date: Math.floor(new Date(LD.date) / 1000),
        bal: OpeningBalance,
      };
    });

    return successMessage(
      res,
      {
        customer: company,
        ledger: final_ledger,
        closing_balance: OpeningBalance,
      },
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

const testApi = async (req, res) => {
  try {
    // Your API logic here
    const companies = await Customer.find({});
    const updateResults = await Promise.all(
      companies.map(async (cm) => {
        const payments = await Payment.updateMany(
          { user_Id: cm._id },
          { branch: cm.branch }
        );
        if (payments.nModified === 0) {
          console.log(`No payments found for userId: ${cm._id}`);
        } else {
          console.log(
            `Updated ${payments.nModified} payments for userId: ${cm._id}, new branch: ${cm.branch}`
          );
        }
        return payments.nModified; // Return the number of modified payments
      })
    );

    return successMessage(res, updateResults, "Test API successful");
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

module.exports = {
  testApi,
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  getCustomerLedger,
  getCashStats,
  SupplieLedger,
};
