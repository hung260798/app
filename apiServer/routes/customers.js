const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const process = require("node:process");
const Customer = require("../models/Customer");
const upload = require("../helper/fileUpload");
const { userAuth } = require("../helper/auth");

module.exports = Router()
  .get("/", async (req, res) => {
    try {
      const { page = 1, nItems = 40 } = req.query;
      const dbquery = Customer.find({});
      dbquery.limit(nItems).skip((page - 1) * nItems);
      const users = await dbquery.exec();
      res.send(users);
    } catch (error) {
      res.send({ error: error.message });
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
      res.send({ error: error.message });
    }
  })
  .get(
    "/cart",
    userAuth.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const customer = await Customer.findById(req.user.id);
        res.send(customer.cart);
      } catch (error) {
        res.send("error");
      }
    }
  )
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
      res.send("error");
      console.error(error);
    }
  })
  .patch("/", upload.single("avatar"), async (req, res) => {
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
      res.send({ error: error.message });
    }
  })
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
      res.send({ error: error.message });
    }
  });
