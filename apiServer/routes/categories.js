const { Router } = require("express");
const Category = require("../models/Category");
const { uploadFile } = require("../helper/upload");
const { adminAuth } = require("../helper/auth");

module.exports = Router()
  .get("/", async (req, res) => {
    try {
      const categories = await Category.find({});
      res.send(categories);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .post(
    "/",
    adminAuth.authenticate("jwt", { session: false }),
    uploadFile.single("coverPhoto"),
    async (req, res) => {
      try {
        const { body } = req;
        const category = new Category(body);
        res.send(await category.save());
      } catch (error) {
        res.send(
          req.app.get("env") === "development" ? error.toString() : "Error"
        );
      }
    }
  )
  .patch(
    "/",
    adminAuth.authenticate("jwt", { session: false }),
    uploadFile.single("coverPhoto"),
    async (req, res) => {
      try {
        const {
          query: { id },
          body,
        } = req;
        const doc = await Category.findById(id);
        for (let k in body) {
          doc[k] = body[k];
        }
        res.send(await doc.save());
      } catch (error) {
        res.send(
          req.app.get("env") === "development" ? error.toString() : "Error"
        );
      }
    }
  );
