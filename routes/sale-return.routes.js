const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const SaleReturnController = require("../controllers/sale-return-controller");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyBranch,
  SaleReturnController.CreateTransaction
);
router.post(
  "/delete",
  VerifyUserCookie,
  VerifyBranch,
  SaleReturnController.DeleteInvoice
);
router.post("/branch", VerifyUserCookie, SaleReturnController.GetReturns);
// router.get("/branch", SaleReturnController.GetBranchSales);
// router.patch("/update", SaleReturnController.UpdateSales);
// router.delete("/delete", SaleReturnController.DeleteSale);

module.exports = router;
