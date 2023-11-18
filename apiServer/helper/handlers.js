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

let categories = [
  {
    _id: "99d7a470275f46f3f2640c3e",
    name: "Phone",
    order: 1,
    description: "description",
  },
  {
    _id: "3b64dadd75db7ea9f785c20b",
    name: "Laptop",
    order: 2,
    description: "description",
  },
  {
    _id: "f9fb4bee4ecac9d8a86f7b12",
    name: "Tablet",
    order: 3,
    description: "description",
  },
];
let products = [
  {
    _id: "c128c36c2a6f6169afddbe95",
    name: "Samsung Galaxy S20",
    price: 21000000,
    stock: 300,
    discount: 10,
    category: "99d7a470275f46f3f2640c3e",
    description: "",
  },
  {
    _id: "1170047b2492743085bd01e9",
    name: "iPhone 15",
    price: 29000000,
    stock: 300,
    discount: 10,
    category: "99d7a470275f46f3f2640c3e",
    description: "",
  },
  {
    _id: "243737da0645c62fe1e6b006",
    name: "Dell XPS",
    price: 26000000,
    stock: 300,
    discount: 10,
    category: "3b64dadd75db7ea9f785c20b",
    description: "",
  },
  {
    _id: "fde7ab4c5b07af8b0ac7d008",
    name: "Acer Predator 3",
    price: 30000000,
    stock: 300,
    discount: 10,
    category: "3b64dadd75db7ea9f785c20b",
    description: "",
  },
];
let customers = [
  {
    _id: "cf7105051ed2755f419dc74c",
    firstName: "hung",
    lastName: "nguyen",
    phone: "0111222333",
  },
  {
    _id: "def8179b2e60ab9b29b671e3",
    firstName: "hung",
    lastName: "vo",
    phone: "0145234133",
  },
  {
    _id: "4954c0ba2832ec66cbf274e2",
    firstName: "son",
    lastName: "vu",
    phone: "0982955312",
  },
];
let orders = [
  {
    _id: "e9dbd7b58b97882b65f4dfd2",
    customer: {
      id: "cf7105051ed2755f419dc74c",
      fullname: "hung nguyen",
    },
    status: "verifying",
    shippingAddress: "DN, VN",
    items: [
      {
        id: "c128c36c2a6f6169afddbe95",
        name: "Samsung Galaxy S20",
        quantity: 2,
      },
      { id: "1170047b2492743085bd01e9", name: "iPhone 15", quantity: 3 },
    ],
  },
  {
    _id: "98aa7400853cbdfa96ce55cd",
    customer: {
      id: "def8179b2e60ab9b29b671e3",
      fullname: "hung vo",
    },
    status: "verifying",
    shippingAddress: "DN, VN",
    items: [
      {
        id: "c128c36c2a6f6169afddbe95",
        name: "Samsung Galaxy S20",
        quantity: 4,
      },
      { id: "243737da0645c62fe1e6b006", name: "Dell XPS", quantity: 2 },
    ],
  },
  {
    _id: "a8d30731b62aa11239aa9675",
    customer: {
      id: "cf7105051ed2755f419dc74c",
      fullname: "hung nguyen",
    },
    status: "verifying",
    shippingAddress: "DN, VN",
    items: [
      { id: "fde7ab4c5b07af8b0ac7d008", name: "Acer Predator 3", quantity: 1 },
    ],
  },
];

let admins = [{ _id: "bc0e37ed2b4e9a0bf22eb838", username: "admin" }];
let employees = [
  {
    _id: "d6e7d9417d3ddf262d3a3bb1",
    firstName: "staff#1",
    lastName: "lastname",
  },
  {
    _id: "1b81ea49a490387ce9f87958",
    firstName: "staff#2",
    lastName: "lastname",
  },
  {
    _id: "bd24d905678299977f864b3f",
    firstName: "staff#3",
    lastName: "lastname",
  },
  {
    _id: "67856138787bbab76b715fa9",
    firstName: "staff#4",
    lastName: "lastname",
  },
];

let suppliers = [
  { name: "Apple" },
  { name: "Samsung" },
  { name: "Dell" },
  { name: "LG" },
  { name: "Asus" },
];

let pw1 = "abc123";
let pw2 = "abc123";
let url = "mongodb://127.0.0.1:27017/online_shop_test";

function loadData() {
  mongoose
    .connect(url)
    .then((m) => m.connection.dropDatabase())
    .then(() => {
      let promises = [];
      for (let e of categories) {
        let a = new Category(e);
        promises.push(a.save());
      }

      for (let e of products) {
        let a = new Product(e);
        promises.push(a.save());
      }

      for (let e of customers) {
        let a = new Customer(e);
        promises.push(
          bcrypt
            .genSalt(10)
            .then((salt) => bcrypt.hash(pw1, salt))
            .then((password) => {
              a.accountPassword = password;
              return a.save();
            })
        );
      }

      for (let e of orders) {
        let a = new Order(e);
        promises.push(a.save());
      }

      for (let e of suppliers) {
        let a = new Supplier(e);
        promises.push(a.save());
      }

      for (let e of admins) {
        let a = new Admin(e);
        promises.push(
          bcrypt
            .genSalt(10)
            .then((salt) => bcrypt.hash(pw2, salt))
            .then((password) => {
              a.password = password;
              return a.save();
            })
        );
      }

      for (let e of employees) {
        let a = new Employee(e);
        promises.push(a.save());
      }

      return Promise.all(promises);
    })
    .then(() => mongoose.connection.close())
    .catch((err) => {
      console.error(err);
    });
}

function findBestSeller() {
  mongoose
    .connect(url)
    .then(() => {
      return Product.aggregate([
        {
          $lookup: {
            from: "orders",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$$id", "$items.id"],
                  },
                },
              },
              {
                $project: {
                  items: 1,
                },
              },
            ],
            as: "inOrders",
          },
        },
        {
          $unwind: {
            path: "$inOrders",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$inOrders.items",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            category: 1,
            price: 1,
            stock: 1,
            discount: 1,
            description: 1,
            orderId: "$inOrders._id",
            itemId: "$inOrders.items.id",
            qty: "$inOrders.items.quantity",
          },
        },
        {
          $match: {
            $expr: {
              $eq: ["$_id", "$itemId"],
            },
          },
        },
        {
          $group: {
            _id: {
              productId: "$_id",
              name: "$name",
            },
            price: {
              $first: "$price",
            },
            discount: {
              $first: "$discount",
            },
            totalOrder: {
              $sum: "$qty",
            },
          },
        },
        {
          $addFields: {
            totalPrice: {
              $multiply: [
                "$totalOrder",
                "$price",
                {
                  $subtract: [
                    1,
                    {
                      $divide: ["$discount", 100],
                    },
                  ],
                },
              ],
            },
          },
        },
      ]);
    })
    .then((rs) => {
      console.log(rs);
    })
    .catch((err) => {
      console.error(err);
    });
}

findBestSeller();
// loadData();
