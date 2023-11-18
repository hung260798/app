const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Token = require("../models/Token");

module.exports = Router()
  .post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username: username });
      if (!admin) {
        throw Error("no user");
      }
      if (!bcrypt.compare(password, admin.password)) {
        throw Error("wrong password");
      }
      return res.send(
        jwt.sign(
          { adminId: admin._id, username: admin.username },
          process.env.JWT_SECRET_KEY,
          { expiresIn: 60 * 60 * 24 }
        )
      );
    } catch (error) {
      res.send({ error: error.message });
    }
  })
  .get("/logout", async (req, res) => {
    try {
      const authHeader = req.get("authorization");
      const token = authHeader.split(" ").pop();
      let rs = await Token.deleteOne({ token });
      res.send({ info: rs });
    } catch (error) {
      res.send({ err: error.message });
    }
  })
  .post("/", async (req, res) => {
    try {
      const {
        body: { password, ...info },
      } = req;
      let admin = new Admin(info);
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);
      admin.password = hash;
      await admin.save();
      res.send(admin);
    } catch (error) {
      res.send({ err: error.message });
    }
  });
