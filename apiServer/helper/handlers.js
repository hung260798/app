var Product = require("../models/Product");
var Order = require("../models/Order");
var Category = require("../models/Category");
var Customer = require("../models/Customer");
var Admin = require("../models/Admin");
var Employee = require("../models/Employee");

exports.getProducts = async (req, res) => {
  try {
    res.send(await Product.find({}));
  } catch (error) {
    res.send(error);
  }
};

exports.getOrders = async (req, res) => {
    try {
      res.send(await Product.find({}));
    } catch (error) {
      res.send(error);
    }
  };

exports.getCategories = async (req, res) => {
  try {
    res.send(await Category.find({}));
  } catch (error) {
    res.send(error);
  }
};

exports.getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.query;
    res.send(await Customer.findById(id));
  } catch (error) {
    res.send(error);
  }
};

exports.postProduct = async (req, res) => {
  try {
    const newProduct = new Customer(req.body);
    res.send(await newProduct.save());
  } catch (error) {
    res.send(error);
  }
};

exports.postOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    res.send(await newOrder.save());
  } catch (error) {
    res.send(error);
  }
};

exports.postCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    res.send(await newCustomer.save());
  } catch (error) {
    res.send(error);
  }
};

exports.adminLogin = async (req, res) => {
  try {
    switch (req.method) {
      case "POST": {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username, password });
        if (!admin) {
          throw "no user";
        }
        return res.send(
          jwt.sign(
            { adminId: admin._id, username: admin.username },
            "sdsjd@ds]jf829233",
            { expiresIn: 60 * 60 * 24 }
          )
        );
      }
    }
  } catch (error) {
    res.send(error);
  }
};
