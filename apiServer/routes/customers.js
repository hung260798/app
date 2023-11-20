const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const process = require("node:process");
const Customer = require("../models/Customer");
const CustomerView = require("../models/views/Customer");
const { uploadFile } = require("../helper/upload");
const { userAuth } = require("../helper/auth");

var router = (module.exports = Router());
router
  .get("/", async (req, res) => {
    try {
      const { page = 1, nItems = 40 } = req.query;
      const dbquery = CustomerView.find({});
      dbquery
        .limit(nItems)
        .skip((page - 1) * nItems)
        .select({ accountPassword: 0 });
      const users = await dbquery.exec();
      res.send(users);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .get("/detail/:id", async (req, res) => {
    try {
      const {
        params: { id },
      } = req;
      const user = await Customer.findById(id);
      res.send(user);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .post("/", async (req, res) => {
    try {
      console.log(req.body);
      const {
        body: { password, ...info },
      } = req;
      let newCustomer = new Customer(info);
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);
      newCustomer.accountPassword = hash;
      await newCustomer.save();
      res.send(newCustomer);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .patch(
    "/",
    userAuth.authenticate("jwt", { session: false }),
    uploadFile.single("avatar"),
    async (req, res) => {
      try {
        const {
          query: { id },
          body,
          file,
        } = req;
        const user = await Customer.findById(id);
        for (let k in body) {
          user[k] = body[k];
        }
        user.avatar = file.filename;
        res.send(await user.save());
      } catch (error) {
        res.send(
          req.app.get("env") === "development" ? error.toString() : "Error"
        );
      }
    }
  )
  .post("/login", async (req, res) => {
    try {
      const { username, phone, password } = req.body;
      const user = await Customer.findOne({ phone: username || phone });
      if (!user) {
        throw "no user";
      }
      const match = await bcrypt.compare(password, user.accountPassword);
      if (!match) {
        throw "wrong password";
      }
      res.send(
        jwt.sign(
          { customerId: user._id, phone: user.phone },
          process.env.JWT_SECRET_KEY,
          { expiresIn: 60 * 60 * 24 }
        )
      );
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  });

router.get(
  "/myaccount",
  userAuth.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let { fields } = req.query;
      const dbquery = Customer.findById(req.user.id);
      if (fields) {
        fields = fields
          .split(",")
          .filter((field) => field !== "accountPassword")
          .join(" ");
        dbquery.select(fields);
      }
      res.send(await dbquery.exec());
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  }
);
