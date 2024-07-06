const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const ReportController = require("../controllers/expenseController");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyBranch,
  ReportController.addExpense
);
router.post(
  "/sale-detail-branch",
  VerifyUserCookie,
  ReportController.SaleDetail
);
router.post(
  "/sale-detail-all",
  VerifyUserCookie,
  ReportController.AllSaleDetail
);
router.post("/all", VerifyUserCookie, ReportController.getAllExpenses);
router.post("/branch", VerifyUserCookie, ReportController.getBranchExpenses);
router.patch(
  "/update",
  VerifyUserCookie,
  VerifyBranch,
  ReportController.UpdateBranch
);
router.delete(
  "/delete",
  VerifyUserCookie,
  VerifyBranch,
  ReportController.deleteExpense
);

module.exports = router;
