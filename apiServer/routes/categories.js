const { Router } = require("express");
const Category = require("../models/Category");
const upload = require("../helper/fileUpload");

module.exports = Router()
  .get("/", async (req, res) => {
    try {
      const categories = await Category.find({});
      res.send(categories);
    } catch (error) {
      res.send({ error: error.message });
    }
  })
  .post("/", upload.single("coverPhoto"), async (req, res) => {
    try {
      const { body } = req;
      const category = new Category(body);
      res.send(await category.save());
    } catch (error) {
      res.send({ error: error.message });
    }
  })
  .patch("/", upload.single("coverPhoto"), async (req, res) => {
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
      res.send({ error: error.message });
    }
  });
