var bcrypt = require("bcrypt");
var mongoose = require("mongoose");
var Admin = require("../models/Admin");
mongoose
  .connect("mongodb://127.0.0.1:27017/online_shop_test")
  .then(() => {
    const admin = new Admin({
      username: "admin",
    });
    const password = "abc123";
    bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        admin.password = hashedPassword;
        return admin.save();
      })
      .then((rs) => console.log(rs));
  })
  .catch((e) => {
    console.log(e.message);
    process.exit(1);
  });
