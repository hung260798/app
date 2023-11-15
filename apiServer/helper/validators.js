const { object, string, number, date } = require("yup");

const productRequest = object({
  query: object({
    category: string(),
    page: number().integer().positive(),
    order: number().oneOf([1, -1]),
    sortBy: string().oneOf(["name", "price"]),
  }),
});

const orderRequest = object({
  query: object({
    page: number().integer().positive(),
    order: number().oneOf([1, -1]),
    sortBy: string().oneOf(["createdAt", "verifiedAt", "customerName"]),
  }),
});



module.exports = {
  products: async (req, res, next) => {
    try {
      await productRequest.validate(req);
      next();
    } catch (error) {
      res.send({ error: error.name, data: null });
    }
  },
};
