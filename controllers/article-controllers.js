const Joi = require("joi");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Article = require("../Models/Article");

const addArticle = async (req, res, next) => {
  let article;
  const { branchId, name, branch } = req.body;

  const reqStr = Joi.string().required();
  const reqNum = Joi.number().required();

  const articleSchema = Joi.object({
    branchId: reqStr,
    name: reqStr,
    branch: reqNum,
  });
  const { error } = articleSchema.validate(req.body);
  if (error) return createError(res, 422, error.message);

  const articleExists = await Article.exists({
    branchId,
    name,
    branch,
  });

  if (articleExists)
    return createError(res, 409, "Email already exists in Branch # " + branch);

  try {
    article = await new Article({
      branchId,
      name,
      branch,
    }).save();
    if (!article) return createError(res, 400, "Unable to Add Article!");
    return successMessage(res, article, "Article Successfully Added!");
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};
const getAllArticles = async (req, res, next) => {
  let articles;
  try {
    articles = await Article.find();
    if (!articles) return createError(res, 404, "No Article record found!");
    return successMessage(res, articles, null);
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || "Internal server error!");
  }
};

const getBranchArticles = async (req, res, next) => {
  const branch = req.params.id;
  // console.log("req.body", branch);
  if (!branch) return createError(res, 422, "Branch is undefined!");

  let articles;
  try {
    if (branch < 0) articles = await Article.find();
    else articles = await Article.find({ branch });
    if (!articles) return createError(res, 404, "No Article record found!");
    return successMessage(
      res,
      articles,
      "Articles data successfully retrieved!"
    );
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

//******************************************************
// working
//******************************************************
const updateArticle = async (req, res, next) => {
  const { articleId, newName } = req.body;
  const reqStr = Joi.string().required();

  const CategoryUpdateSchema = Joi.object({
    articleId: reqStr,
    newName: reqStr,
  });
  // check if the validation returns error
  const { error } = CategoryUpdateSchema.validate(req.body);
  if (error) return createError(res, 422, error.message);

  try {
    const article = await Article.findByIdAndUpdate(
      articleId,
      {
        name: newName,
      },
      {
        new: true,
      }
    );

    if (!article) {
      return createError(res, 404, "Article with such id was not found!");
    }

    return successMessage(res, article, "Article Successfully Updated!");
  } catch (err) {
    return createError(res, 500, error.message || error);
  }
};

//******************************************************
// working
//******************************************************
const deleteArticle = async (req, res, next) => {
  const { id: articleId } = req.params;

  // console.log("Article Id: ", req.body);

  try {
    const delArticle = await Article.findByIdAndDelete(articleId);
    if (!delArticle)
      return createError(
        res,
        400,
        "Such Article with " + articleId + " does not exist!"
      );
    else
      return successMessage(
        res,
        delArticle,
        `Article ${delArticle.name} is successfully deleted!`
      );
  } catch (err) {
    return createError(res, 500, err.message || err);
  }
};

module.exports = {
  getBranchArticles,
  addArticle,
  getAllArticles,
  updateArticle,
  deleteArticle,
};
