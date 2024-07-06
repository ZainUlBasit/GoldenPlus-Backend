const Joi = require("joi");
const Expense = require("../Models/Expense");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Transaction = require("../Models/Transaction");
const User = require("../Models/User");

const getAllExpenses = async (req, res, next) => {
  const { fromDate = 0, toDate = Math.floor(Date.now() / 1000) } = req.body;
  const startDate = Math.floor(new Date(fromDate) / 1000);
  const endDate = Math.floor(new Date(toDate) / 1000);
  let expenses;
  try {
    expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    if (!expenses) return createError(res, 404, "No Expense Found");
    return successMessage(res, expenses, null);
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};
const getBranchExpenses = async (req, res) => {
  const { branch, fromDate, toDate } = req.body;

  // Validate dates
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);

  if (isNaN(startDate) || isNaN(endDate)) {
    return createError(res, 422, "Invalid date format");
  }

  // Convert dates to Unix timestamps in seconds
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);
  // Check if fromDate is before or equal to toDate
  if (startTimestamp > endTimestamp) {
    return createError(
      res,
      422,
      "From date must be less than or equal to To date"
    );
  }

  // Validate branch
  if (!branch) {
    return createError(res, 422, "Invalid Branch #");
  }

  try {
    let Payload =
      branch === -1
        ? {
            date: {
              $gte: startTimestamp,
              $lte: endTimestamp,
            },
          }
        : {
            branch: Number(branch),
            date: {
              $gte: startTimestamp,
              $lte: endTimestamp,
            },
          };
    const expenses = await Expense.find(Payload);

    if (!expenses || expenses.length === 0) {
      return createError(res, 404, "No Expense Found");
    }

    return successMessage(res, expenses, null);
  } catch (err) {
    console.error(err);
    return createError(res, 500, "Internal Server Error");
  }
};

const addExpense = async (req, res, next) => {
  const {
    date = Math.floor(Date.now() / 1000),
    desc,
    expense,
    branch,
  } = req.body;

  const reqStr = Joi.string().required();
  const reqNum = Joi.number().required();

  const ExpenseSchema = Joi.object({
    date: Joi.number().default(Math.floor(Date.now() / 1000)),
    desc: reqStr,
    expense: reqNum,
    branch: reqNum,
  });

  const { error } = ExpenseSchema.validate(req.body.values);
  if (error) {
    return createError(res, 422, error.message);
  }

  let newExpense;
  try {
    newExpense = await new Expense({
      date: Math.floor(new Date(date) / 1000),
      desc,
      expense,
      branch,
    }).save();
    if (!newExpense) return createError(res, 400, "Unable to add Expense!");
    return successMessage(res, newExpense, "Expense Successfully Added!");
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const deleteExpense = async (req, res, next) => {
  const { expenseId } = req.body;
  if (!expenseId) return createError(res, 422, "Invalid Expense Id!");
  try {
    const DeleteExpense = await Expense.findByIdAndDelete(expenseId);
    if (!DeleteExpense)
      return createError(
        res,
        400,
        "Such Expense with expenseId does not exist!"
      );
    return successMessage(
      res,
      DeleteExpense,
      `Expense ${DeleteExpense._id} is successfully deleted!`
    );
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const SaleDetail = async (req, res) => {
  const { from = new Date(), to = new Date(), branch } = req.body;
  console.log(req.body);

  // Set the time to the beginning of the day (00:00:00)
  // from.setHours(0, 0, 0, 0);
  // to.setHours(23, 59, 59, 999);
  const fromDateInSeconds = Math.floor(new Date(from) / 1000);
  const toDateInSeconds = Math.floor(new Date(to) / 1000);

  console.log(fromDateInSeconds);
  console.log(toDateInSeconds);

  try {
    // Retrieve transactions for the given customer within the specified date range
    let transactions = await Transaction.find({
      date: { $gte: fromDateInSeconds, $lte: toDateInSeconds },
    })
      .populate("items")
      .populate("customerId");
    transactions = transactions.filter((tr) => tr.customerId.branch === branch);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++");
    console.log(transactions);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++");

    const listOfItem = transactions.map((data) => {
      return data.items.map((item) => {
        return {
          currentSale: item.price * item.qty,
          currentPurchases: item.purchase * item.qty,
          currentQty: item.qty,
        };
      });
    });

    // =========================
    console.log(listOfItem);
    // =========================

    // Flatten the array of arrays into a single array
    const flattenedList = listOfItem.flat();

    // Calculate the total sales
    const totalSales = flattenedList.reduce((total, item) => {
      return total + item.currentSale;
    }, 0);

    // Calculate the total purhchases
    const totalPurchases = flattenedList.reduce((total, item) => {
      return total + item.currentPurchases;
    }, 0);

    // Calculate the total qty
    const totalQty = flattenedList.reduce((total, item) => {
      return total + item.currentQty;
    }, 0);

    const listOfExpense = await Expense.find({
      branch,
      date: {
        $gte: fromDateInSeconds,
        $lte: toDateInSeconds,
      },
    });

    const totalExpense = listOfExpense.reduce((total, expense) => {
      return total + expense.expense;
    }, 0);

    return successMessage(
      res,
      {
        branch: branch,
        totalSale: totalSales,
        totalPurchases: totalPurchases,
        totalQty: totalQty,
        totalExpense: totalExpense,
        totalProfit:
          Number(totalSales) - Number(totalPurchases) - Number(totalExpense),
      },
      ""
    );
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

const AllSaleDetail = async (req, res) => {
  const { from = new Date(), to = new Date(), branch } = req.body;

  // Set the time to the beginning of the day (00:00:00)
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  const fromDateInSeconds = Math.floor(new Date(from) / 1000);
  const toDateInSeconds = Math.floor(new Date(to) / 1000);

  try {
    const Users = await User.find({ role: 2 });

    const AllDetails = await Promise.all(
      Users.map(async (user) => {
        let transactions = await Transaction.find({
          date: { $gte: fromDateInSeconds, $lte: toDateInSeconds },
        })
          .populate("items")
          .populate("customerId");
        transactions = transactions.filter(
          (tr) => tr.customerId.branch === user.branch_number
        );

        const listOfItem = transactions.map((data) => {
          return data.items.map((item) => {
            return {
              currentSale: item.price,
              currentPurchases: item.purchase,
              currentQty: item.qty,
            };
          });
        });

        // Flatten the array of arrays into a single array
        const flattenedList = listOfItem.flat();

        // Calculate the total sales
        const totalSales = flattenedList.reduce((total, item) => {
          return total + item.currentSale;
        }, 0);

        // Calculate the total purhchases
        const totalPurchases = flattenedList.reduce((total, item) => {
          return total + item.currentPurchases;
        }, 0);

        // Calculate the total qty
        const totalQty = flattenedList.reduce((total, item) => {
          return total + item.currentQty;
        }, 0);

        const listOfExpense = await Expense.find({
          branch: user.branch_number,
          date: {
            $gte: fromDateInSeconds,
            $lte: toDateInSeconds,
          },
        });

        const totalExpense = listOfExpense.reduce((total, expense) => {
          return total + expense.expense;
        }, 0);

        return {
          branch: user.branch_number,
          totalSale: totalSales,
          totalPurchases: totalPurchases,
          totalQty: totalQty,
          totalExpense: totalExpense,
          totalProfit:
            Number(totalSales) - Number(totalPurchases) - Number(totalExpense),
        };
      })
    );

    return successMessage(res, AllDetails, "");
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

const UpdateBranch = async (req, res) => {
  const { expenseId, payload } = req.body;
  if (!expenseId || !payload)
    return createError(res, 422, "Required fields are undefined!");

  try {
    const expenseUpdate = await Expense.findByIdAndUpdate(
      expenseId,
      { ...payload, date: Math.floor(new Date(payload.date) / 1000) },
      {
        new: true,
      }
    );
    if (!expenseUpdate) return createError(res, 404, "No data found!");
    else
      return successMessage(
        res,
        expenseUpdate,
        "Expnese Successfully Updated!"
      );
  } catch (err) {
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

module.exports = {
  getBranchExpenses,
  getAllExpenses,
  addExpense,
  deleteExpense,
  SaleDetail,
  AllSaleDetail,
  UpdateBranch,
};
