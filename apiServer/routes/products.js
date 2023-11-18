const { Router } = require("express");
const path = require("path");
const { unlink } = require("fs/promises");
const Product = require("../models/Product");
const upload = require("../helper/fileUpload");

const productPhotosMaxCount = 15;
const productsPerPage = 24;

module.exports = Router()
  .get("/", async (req, res) => {
    try {
      res.send(await Product.find({}));
    } catch (error) {
      res.send({ error: error.message });
    }
  })
  .get("/q", async (req, res) => {
    try {
      const {
        sortBy,
        order = 1,
        category,
        page = 1,
        searchName,
        field,
      } = req.query;
      const dbquery = Product.find({});
      if (category) {
        dbquery.find({ category });
      }
      if (searchName) {
        dbquery.find({ name: RegExp(searchName) });
      }
      if (sortBy) {
        dbquery.sort({ [sortBy]: +order });
      }
      if (field) {
        const fields = field.split(",");
        dbquery.select(fields.join(" "));
      }
      dbquery.skip((page - 1) * productsPerPage).limit(productsPerPage);
      const result = await dbquery.exec();
      res.send(result);
    } catch (error) {
      res.send({ error: error.message });
    }
  })
  .get("/byid/:id", async (req, res) => {
    try {
      const {
        params: { id },
      } = req;
      const product = await Product.findById(id);
      res.send(product);
    } catch (error) {
      res.send({ error: error.message });
    }
  })
  .get("/byname/:name", async (req, res) => {
    try {
      const {
        params: { name },
      } = req;
      const product = await Product.findOne({ name: name });
      res.send(product);
    } catch (error) {
      res.send({ error: error.message });
    }
  })
  .post(
    "/",
    upload.fields([
      { name: "coverPhoto", maxCount: 1 },
      { name: "photos", maxCount: productPhotosMaxCount },
    ]),
    async (req, res) => {
      try {
        const product = new Product(req.body);
        const { coverPhoto = [], photos = [] } = req.files;
        product.coverPhoto = coverPhoto.map(({ filename }) => filename)[0];
        product.photos = photos.map((item) => item.filename);
        res.send(await product.save());
      } catch (error) {
        res.send({ error: error.message });
      }
    }
  )
  .patch(
    "/",
    upload.fields([
      { name: "coverPhoto", maxCount: 1 },
      { name: "photos", maxCount: productPhotosMaxCount },
    ]),
    async (req, res) => {
      try {
        const {
          body,
          query: { id },
        } = req;
        const product = await Product.findById(id);
        for (let k in body) {
          product[k] = body[k];
        }
        const { coverPhoto: [cv] = [], photos = [] } = req.files;
        let deletedPhotos = [];
        if (!body.photos) body.photos = [];
        deletedPhotos = product.photos.filter(
          (item) => !body.photos.include(item)
        );
        if (cv) {
          deletedPhotos.push(product.coverPhoto);
          product.coverPhoto = cv.filename;
        }
        product.photos = [
          ...body.photos,
          ...photos.map((item) => item.filename),
        ];
        for (const photo of deletedPhotos) {
          const fpath = path.join(process.env.UPLOAD_DIR, photo);
          await unlink(fpath);
        }
        res.send(await product.save());
      } catch (error) {
        res.send({ error: error.message });
      }
    }
  )
  .delete("/", async (req, res) => {
    try {
      const {
        query: { id },
      } = req;
      const product = await Product.findByIdAndDelete(id);
      res.send(product);
    } catch (error) {
      res.send({ error: error.message });
    }
  });
