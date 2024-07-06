const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const CustomerController = require("../controllers/customer-controllers");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyBranch,
  CustomerController.addCustomer
);
router.post("/all", CustomerController.getAllCustomers);
router.post("/branch", VerifyUserCookie, CustomerController.getBranchCustomers);
router.patch(
  "/update",
  VerifyUserCookie,
  VerifyBranch,
  CustomerController.UpdateCustomer
);
router.delete(
  "/delete/:id",
  VerifyUserCookie,
  VerifyBranch,
  CustomerController.deleteCustomer
);
router.get(
  "/get-bill-nos/:id",
  VerifyUserCookie,
  VerifyBranch,
  CustomerController.Get_Bill_No
);

module.exports = router;
