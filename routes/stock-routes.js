const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const StockController = require("../controllers/StockController");

router.post("/add", VerifyUserCookie, VerifyBranch, StockController.AddStock);
router.patch(
  "/edit",
  VerifyUserCookie,
  VerifyBranch,
  StockController.EditStock
);
router.delete(
  "/delete/:id",
  VerifyUserCookie,
  VerifyBranch,
  StockController.DeleteStock
);
router.post(
  "/all",
  VerifyUserCookie,
  VerifyBranch,
  StockController.GetStockByAdmin
);
router.post("/branch", VerifyUserCookie, StockController.GetStockByBranch);
// router.patch("/update", StockController.UpdateSales);
// router.delete("/delete", StockController.DeleteSale);

module.exports = router;
