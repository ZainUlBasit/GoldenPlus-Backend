const router = require("express").Router();
const { VerifyUserCookie, VerifyAdmin } = require("../Middleware/auth");
const BranchController = require("../controllers/BranchController");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyAdmin,
  BranchController.createBranch
);
router.get("/all", VerifyUserCookie, VerifyAdmin, BranchController.getBranches);
router.patch(
  "/update",
  VerifyUserCookie,
  VerifyAdmin,
  BranchController.updateBranch
);

// router.post("/branch", BranchController.getBranchCustomers);
// router.delete("/delete/:id", BranchController.deleteCustomer);

module.exports = router;
