const Account = require("../Models/Account");
const { successMessage, createError } = require("../utils/ResponseMessage");

// Create a new account
const createAccount = async (req, res) => {
  try {
    const { account_name, account_no, branchId, branch_name } = req.body;
    const newAccount = new Account({
      account_name,
      account_no,
      branchId,
      branch_name,
    });
    const savedAccount = await newAccount.save();
    return successMessage(
      res,
      savedAccount,
      "Account Successfully Registered!"
    );
  } catch (err) {
    return createError(res, 500, err.message);
  }
};

// Get all accounts
const getAccounts = async (req, res) => {
  const { branchId } = req.body;
  try {
    let accounts;
    if (branchId === -1) accounts = await Account.find();
    else accounts = await Account.find({ branchId });
    console.log(accounts);
    return successMessage(res, accounts, "Accounts Successfully Retrieved!");
  } catch (err) {
    return createError(res, 500, err.message);
  }
};

// Get a single account by ID
const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an account by ID
const updateAccount = async (req, res) => {
  try {
    const { account_name, account_no, accountId } = req.body;
    const account = await Account.findByIdAndUpdate(
      accountId,
      { account_name, account_no },
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const updateAccountAmount = async (req, res) => {
  try {
    const { amount, accountId } = req.body;
    const account = await Account.findByIdAndUpdate(
      accountId,
      { $inc: { amount: amount } },
      { new: true }
    );
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an account by ID
const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) return createError(res, 404, "Account not found");
    return successMessage(res, 200, "Account deleted successfully");
  } catch (err) {
    return createError(res, 500, err.message);
  }
};

module.exports = {
  createAccount,
  updateAccount,
  updateAccountAmount,
  deleteAccount,
  getAccounts,
};
