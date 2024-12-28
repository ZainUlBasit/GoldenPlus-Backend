const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const TransactionController = require("../controllers/transaction-controllers");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyBranch,
  TransactionController.CreateTransaction
);
router.post("/all", VerifyUserCookie, TransactionController.GetTransactions);
router.get("/:id", VerifyUserCookie, TransactionController.GetTransactionById);
router.post("/summary", VerifyUserCookie, TransactionController.GetItemSummary);
router.post(
  "/delete",
  VerifyUserCookie,
  VerifyBranch,
  TransactionController.DeleteInvoice
);
router.post(
  "/check-invoice-no",
  VerifyUserCookie,
  VerifyBranch,
  TransactionController.CheckBillNumber
);
router.post(
  "/update-invoice-data",
  VerifyUserCookie,
  VerifyBranch,
  TransactionController.UpdateInvoiceItem
);
router.post(
  "/get-invoice-item",
  VerifyUserCookie,
  VerifyBranch,
  TransactionController.GetInvoiceData
);
router.post(
  "/delete-invoice-item",
  VerifyUserCookie,
  VerifyBranch,
  TransactionController.DeleteInvoiceItem
);

module.exports = router;
