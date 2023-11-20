const { Router } = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function verifyOrder(req, res) {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    order.verifiedAt = new Date();
    order.status = "waiting";
    console.log(await order.save());
    res.send("OK");
  } catch (error) {
    res.send(req.app.get("env") === "development" ? error.toString() : "Error");
  }
}

async function cancelOrder(req, res) {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    order.status = "cancelled";
    for (let item of order.items) {
      const product = await Product.findById(item.id);
      product.stock += item.quantity;
      await product.save();
    }
    console.log(await order.save());
    res.send("OK");
  } catch (error) {
    res.send(req.app.get("env") === "development" ? error.toString() : "Error");
  }
}

module.exports = Router()
  .get("/", async function (req, res) {
    try {
      const {
        sortBy,
        order = 1,
        page = 1,
        nItems = 40,
        searchBy,
        searchTerm,
      } = req.query;
      const dbquery = Order.find({});
      if (searchBy) {
        dbquery.find({ [searchBy]: RegExp(searchTerm) });
      }
      if (sortBy) {
        dbquery.sort({ [sortBy]: order });
      }
      dbquery.limit(nItems).skip((page - 1) * nItems);
      const orders = await dbquery.exec();
      res.send(orders);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .get("/byid/:id", async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      res.send(order);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .get("/myorders", async (req, res) => {
    try {
      const orders = await Order.find({ "customer.id": req.user._id });
      res.send(orders);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .post("/", async (req, res) => {
    try {
      const order = new Order(req.body);
      for (let item of order.items) {
        const product = await Product.findById(item.id);
        product.stock -= item.quantity;
      }
      res.send(await order.save());
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .patch("/", async (req, res) => {
    try {
      const {
        body,
        query: { id },
      } = req;
      const order = await Order.findById(id);
      for (let k in body) {
        order[k] = body[k];
      }
      res.send(await order.save());
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .post("/verify", async (req, res) => {
    try {
      const {
        body: { id },
      } = req;
      const order = await Order.findById(id);
      for (let item of order.items) {
        const product = await Product.findById(item.id);
        product.stock -= item.quantity;
        await product.save();
      }
      order.status = "waiting";
      res.send(await order.save());
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .delete("/", async (req, res) => {
    try {
      const {
        query: { id },
      } = req;
      const order = await Order.findByIdAndDelete(id);
      res.send(order);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  });
