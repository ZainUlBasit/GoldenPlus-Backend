const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const CompanyController = require("../controllers/company-controller");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyBranch,
  CompanyController.CreateCompany
);
router.post("/branch", VerifyUserCookie, CompanyController.getBranchCompanies);
router.patch(
  "/update",
  VerifyUserCookie,
  VerifyBranch,
  CompanyController.updateCompany
);
router.delete(
  "/delete/:id",
  VerifyUserCookie,
  VerifyBranch,
  CompanyController.deleteCompany
);

router.get("/all", CompanyController.getAllCompanies);

module.exports = router;
