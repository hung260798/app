const { Router } = require("express");
const Employee = require("../models/Employee");

module.exports = Router()
  .get("/", async (req, res) => {
    try {
      const employees = await Employee.find({});
      res.send(employees);
    } catch (error) {
      res.send({ err: error.name });
    }
  })
  .get("/detail/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);
      res.send(employee);
    } catch (error) {
      res.send({ err: error.name });
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
      res.send({ err: error.name });
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
      res.send({ err: error.name });
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
      res.send({ err: error.name });
    }
  });
