const { Router } = require("express");
const path = require("path");
const { unlink } = require("fs/promises");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Category = require("../models/Category");
const Employee = require("../models/Employee");
const Token = require("../models/Token");
const validator = require("../helper/validators");
const { adminAuth, userAuth, userAuthMiddlewares } = require("../helper/auth");

var router = (module.exports = Router());
const productPhotosMaxCount = 15;
const productsPerPage = 24;
const uploadDir = "public/uploads";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const extesion = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extesion);
  },
});

const upload = multer({ storage: storage });

// /products router
router.use(
  "/products",
  Router()
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
            const fpath = path.join(uploadDir, photo);
            await unlink(fpath);
          }
          res.send(await product.save());
        } catch (error) {
          res.send({ error: error.message });
        }
      }
    )
    .post(
      "/update",
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
          const { coverPhoto = [], photos = [] } = req.files;
          const deletedPhotos = [
            ...product.photos.filter((item) => !photos.include(item)),
          ];
          product.coverPhoto = coverPhoto[0].filename;
          product.photos = [
            ...product.photos,
            ...photos.map((item) => item.filename),
          ];
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
    })
);

// /categories router
router.use(
  "/categories",
  Router()
    .get("/", async (req, res) => {
      try {
        const categories = await Category.find({});
        res.send(categories);
      } catch (error) {
        res.send({ error: error.message });
      }
    })
    .post("/", upload.single("coverPhoto"), async (req, res) => {
      try {
        const { body } = req;
        const category = new Category(body);
        res.send(await category.save());
      } catch (error) {
        res.send({ error: error.message });
      }
    })
    .patch("/", upload.single("coverPhoto"), async (req, res) => {
      try {
        const {
          query: { id },
          body,
        } = req;
        const doc = await Category.findById(id);
        for (let k in body) {
          doc[k] = body[k];
        }
        res.send(await doc.save());
      } catch (error) {
        res.send({ error: error.message });
      }
    })
);

// /orders router
router.use(
  "/orders",
  Router()
    .get("/", async (req, res) => {
      try {
        const orders = await Order.find({});
        res.send(orders);
      } catch (error) {
        res.send({ error: error.message });
      }
    })
    .get("/query", async function (req, res) {
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
        res.send({ error: error.message });
      }
    })
    .get("/detail/:id", async (req, res) => {
      try {
        const {
          params: { id },
        } = req;
        const order = await Order.findById(id);
        res.send(order);
      } catch (error) {
        res.send({ error: error.message });
      }
    })
    .get("/myOrders", async (req, res) => {
      try {
        const {
          user: { _id: customerId },
        } = req;
        const orders = await Order.find({ "customer.id": customerId });
        res.send(orders);
      } catch (error) {
        res.send({
          error: error.message,
        });
      }
    })
    .post("/", async (req, res) => {
      try {
        const order = new Order(req.body);
        for (let item of order.items) {
          const product = await Product.findById(item.id);
          if (item.quantity > product.stock) throw Error("not enough product");
        }
        res.send(await order.save());
      } catch (error) {
        res.send({ error: error.message });
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
        res.send({ error: error.message });
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
        res.send({ error: error.message });
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
        res.send({ error: error.message });
      }
    })
);

// /customers router
router.use(
  "/customers",
  Router()
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
    .post("/", async (req, res) => {
      try {
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
        res.send({ error: error.name });
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
        const { username, password } = req.body;
        const user = await Customer.findOne({ phone: username });
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
);

// /employees router
router.use(
  "/employees",
  Router()
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
    })
);

// /admin router
router.use(
  "/admin",
  Router()
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
    })
);

// */demo
router.use(
  "/demo",
  Router()
    .post("/", upload.array("photos", 15), async (req, res) => {
      res.end();
    })
    .get("/", (req, res) => {
      res.render("demo");
    })
    .get("/add-product", (req, res) => {
      res.render("addProduct", {});
    })
    .get("/pro", async function (req, res) {
      try {
        res.send(
          `<form 
          action="/demo/pro" 
          method="post" 
          enctype="multipart/form-data">
            <input type='file' name='cjdm' multiple />
            <button>submit</button>
          </form>`
        );
      } catch (error) {
        res.send({ err: error.message });
      }
    })
    .post(
      "/pro",
      upload.fields([{ name: "cjdm", maxCount: 2 }]),
      (req, res) => {
        console.log(req.files.cjdm);
        res.end();
      }
    )
    .get("/t2", (req, res) => {
      console.log(req.query);
      res.end();
    })
);
