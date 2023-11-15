var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var md, schema;

schema = new Schema({
  name: String,
  phone: String,
  email: String,
  picture: String,
});

module.exports = model("Supplier", schema);
