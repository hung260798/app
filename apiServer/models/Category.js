var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var md, schema;

schema = new Schema({
  name: String,
  description: String,
  order: Number,
  coverPhoto: String,
});

module.exports = model("Category", schema);
