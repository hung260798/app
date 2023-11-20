const { Router } = require("express");

const { ProductSalesView } = require("../models/views/ProductSales");
const { ProductTotalPrice } = require("../models/views/ProductTotalPrice");
const { uploadFile, deleteFile } = require("../helper/upload");
const { adminAuth } = require("../helper/auth");
const Product = require("../models/Product");

const productPhotosMaxCount = 15;
const productsPerPage = 24;

var router = (module.exports = Router());
router
  .get("/", async (req, res) => {
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
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .get("/byid/:id", async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      res.send(product);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .post(
    "/",
    adminAuth.authenticate("jwt", { session: false }),
    uploadFile.fields([
      { name: "coverPhoto", maxCount: 1 },
      { name: "photos", maxCount: productPhotosMaxCount },
    ]),
    async (req, res) => {
      try {
        const product = new Product(req.body);
        const { coverPhoto = [], photos = [] } = req.files;
        product.coverPhoto = coverPhoto.map(({ filename }) => filename)[0];
        product.photos = photos.map((item) => item.filename);
        const result = await product.save();
        res.send(result);
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
    uploadFile.fields([
      { name: "coverPhoto", maxCount: 1 },
      { name: "photos", maxCount: productPhotosMaxCount },
    ]),
    async (req, res) => {
      try {
        const product = await Product.findById(req.query.id);
        const oldPhotos = product.photos.slice();
        const oldCoverPhoto = product.coverPhoto;
        for (let k in req.body) {
          product[k] = req.body[k];
        }
        const deletedPhotos = [
          ...oldPhotos.filter((item) => !product.photos.includes(item)),
          ...(!product.coverPhoto ? [oldCoverPhoto] : []),
        ];
        product.photos = [
          ...product.photos,
          ...(req.files.photos
            ? req.files.photos.map((item) => item.filename)
            : []),
        ];
        product.coverPhoto ??= req.files.coverPhoto
          ? req.files.coverPhoto[0]?.filename
          : "";
        for (const p of deletedPhotos) {
          await deleteFile(p);
        }
        res.send(await product.save());
      } catch (error) {
        res.send(
          req.app.get("env") === "development" ? error.toString() : "Error"
        );
      }
    }
  )
  .delete(
    "/",
    adminAuth.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const product = await Product.findById(req.query.id);
        const deletedPhotos = [...product.photos, product.coverPhoto];
        for (const p of deletedPhotos) {
          await deleteFile(p);
        }
        const result = await product.deleteOne();
        res.send(result);
      } catch (error) {
        res.send(
          req.app.get("env") === "development" ? error.toString() : "Error"
        );
      }
    }
  );

router.get("/queries", async (req, res) => {
  try {
    switch (req.query.name) {
      case "productSale": {
        const result = await ProductSalesView.find({}).sort("-name");
        return res.send(result);
      }
      case "producttotalprice": {
        const result = await ProductTotalPrice.find({}).sort("-totalPrice");
        return res.send(result);
      }
    }
  } catch (error) {
    res.send(req.app.get("env") === "development" ? error.toString() : "Error");
  }
});
