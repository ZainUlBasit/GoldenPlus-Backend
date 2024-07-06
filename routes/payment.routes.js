const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const PaymentController = require("../controllers/payment-controller");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyBranch,
  PaymentController.addPayment
);
router.post("/all", PaymentController.getAllPayments);
router.post("/branch", VerifyUserCookie, PaymentController.getBranchPayments);
router.post(
  "/update",
  VerifyUserCookie,
  VerifyBranch,
  PaymentController.updatePayment
);
router.post(
  "/delete",
  VerifyUserCookie,
  VerifyBranch,
  PaymentController.deletePayment
);

module.exports = router;
