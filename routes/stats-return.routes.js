const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const StatsController = require("../controllers/stats-controllers");

router.get(
  "/article-stat/:id",
  VerifyUserCookie,
  VerifyBranch,
  StatsController.getArticleStats
);

module.exports = router;
