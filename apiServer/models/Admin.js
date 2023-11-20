var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  type: { type: String },
});

module.exports = model("Admin", schema);
