const { Router } = require("express");
const Employee = require("../models/Employee");
const { adminAuth } = require("../helper/auth");

const router = (module.exports = Router());
router.use(adminAuth.authenticate("jwt", { session: false }));

router
  .get("/", async (req, res) => {
    try {
      const employees = await Employee.find({});
      res.send(employees);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .get("/detail/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);
      res.send(employee);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  })
  .post("/", async (req, res) => {
    try {
      const { body } = req;
      const employee = new Employee();
      for (let k in body) {
        employee[k] = body[k];
      }
      await employee.save();
      res.send(employee);
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
      const employee = await Employee.findById(id);
      for (let k in body) {
        employee[k] = body[k];
      }
      await employee.save();
      res.send(employee);
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
      const employee = await Employee.findByIdAndDelete(id);
      res.send(employee);
    } catch (error) {
      res.send(
        req.app.get("env") === "development" ? error.toString() : "Error"
      );
    }
  });
