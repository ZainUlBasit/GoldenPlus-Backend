const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const ArticleController = require("../controllers/article-controllers");

router.post(
  "/create",
  VerifyUserCookie,
  VerifyBranch,
  ArticleController.addArticle
);
router.get(
  "/branch/:id",
  VerifyUserCookie,
  ArticleController.getBranchArticles
);
router.patch(
  "/update",
  VerifyUserCookie,
  VerifyBranch,
  ArticleController.updateArticle
);

router.delete("/delete/:id", ArticleController.deleteArticle);
router.get("/all", ArticleController.getAllArticles);

module.exports = router;
