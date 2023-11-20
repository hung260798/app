var Product = require("../models/Product");
var Order = require("../models/Order");
var Category = require("../models/Category");
var Customer = require("../models/Customer");
var Admin = require("../models/Admin");
var Employee = require("../models/Employee");
var Supplier = require("../models/Supplier");
const { default: mongoose } = require("mongoose");
const {
  Types: { ObjectId },
} = mongoose;
const bcrypt = require("bcrypt");

const url = "mongodb://127.0.0.1:27017/online_shop_test";

async function insert1() {
  const pw1 = "abc123";
  const pw2 = "123abc";
  const phone = "+84 916 409 925";
  const salt = await bcrypt.genSalt(10);
  const hash1 = await bcrypt.hash(pw1, salt);
  const hash2 = await bcrypt.hash(pw2, salt);

  const categories = [
    ["phone", 1],
    ["laptop", 2],
    ["tablet", 3],
  ];
  const ids1 = [];
  for (let i of categories) {
    const c = new Category({
      name: i[0],
      coverPhoto: "noPhoto",
      order: i[1],
    });
    ids1.push(await c.save());
  }

  const customers = [
    ["hung", "nguyen"],
    ["quyen", "vo"],
    ["son", "vu"],
  ];
  const ids2 = [];
  for (let i of customers) {
    const c = new Customer({
      firstName: i[0],
      lastName: i[1],
      phone,
      email: "user@gmail.com",
      isVerified: true,
      accountPassword: hash1,
    });
    ids2.push(await c.save());
  }

  const employees = [
    ["quang", "ng", "male"],
    ["dung", "ng", "male"],
    ["tuyen", "ng", "female"],
    ["luong", "ng", "male"],
  ];
  const ids3 = [];
  for (let i of employees) {
    const c = new Employee({
      firstName: i[0],
      lastName: i[1],
      gender: i[2],
      phone,
      email: "staff@mail.com",
    });
    ids3.push(await c.save());
  }

  const suppliers = [
    ["Samsung", "samsung@ss.com"],
    ["Apple", "apple@ap.com"],
    ["Dell", "dell@hotmail.com"],
    ["Acer", "acer@ac.com"],
  ];
  const ids4 = [];
  for (let i of suppliers) {
    const c = new Supplier({
      name: i[0],
      email: i[1],
      phone,
    });
    ids4.push(await c.save());
  }

  const admin = new Admin({
    username: "admin",
    password: hash2,
  });
  await admin.save();
}

async function insert2() {
  const products = [
    ["Samsung galaxy S20", "phone", "Samsung"],
    ["iPhone 15", "phone", "Apple"],
    ["Acer Predator 3", "laptop", "Acer"],
    ["Dell inspiron 3580", "laptop", "Dell"],
  ];
  const ids5 = [];
  for (let i of products) {
    const c = new Product({
      name: i[0],
      price: 30,
      stock: 200,
      discount: 10,
      coverPhoto: "noImg",
      category: {
        name: i[1],
        id: (await Category.findOne({ name: i[1] })).id,
      },
      supplier: {
        name: i[2],
        id: (await Supplier.findOne({ name: i[2] })).id,
      },
    });
    const rs = await c.save();
    ids5.push(rs);
  }

  const orders = [
    [new Date(), null, false, "WAITING", "hung", [[1, 2]]],
    [
      new Date(2022, 11, 10, 9, 12, 20),
      new Date(2022, 11, 20, 9, 12, 20),
      true,
      "COMPLETED",
      "son",
      [
        [2, 5],
        [1, 7],
      ],
    ],
    [
      new Date(2021, 4, 2, 16, 10, 0),
      new Date(2021, 4, 12, 16, 10, 0),
      true,
      "COMPLETED",
      "quyen",
      [
        [3, 1],
        [4, 3],
      ],
    ],
    [
      new Date(2023, 8, 29, 16, 10, 0),
      new Date(2023, 9, 1, 16, 10, 0),
      true,
      "CANCELLED",
      "hung",
      [[4, 9]],
    ],
  ];
  const ids6 = [];
  const nProduct = products.length;
  for (let i of orders) {
    const c = new Order({
      createdAt: i[0],
      completedAt: i[1],
      isVerified: i[2],
      status: i[3],
      items: [],
      shippingAddress: "DN, VN",
      customer: {
        name: i[4],
        id: (await Customer.findOne({ firstName: i[4] })).id,
      },
    });
    i[5].forEach((item) => {
      const [idx, qty] = item;
      const p = ids5[idx % nProduct];
      c.items.push({
        id: p.id,
        name: p.name,
        price: p.price,
        discount: p.discount,
        quantity: qty,
      });
    });
    ids6.push(await c.save());
  }
}

(async () => {
  const task = process.argv[2];
  await mongoose.connect(url);
  if (task === "1") {
    await mongoose.connection.dropDatabase();
    await insert1();
  } else {
    await mongoose.connection.dropCollection("products");
    await mongoose.connection.dropCollection("orders");
    await insert2();
  }
  await mongoose.connection.destroy();
})();
