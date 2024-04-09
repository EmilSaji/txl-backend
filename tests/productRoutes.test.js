const request = require("supertest");
const express = require("express");
const productRoutes = require("../routes/productRoutes");

const connection = {
  execute: jest.fn().mockResolvedValue([
    [
      { category: "Electronics", total_value: 500 },
      { category: "Books", total_value: 200 },
      { category: "Food", total_value: 400 },
    ],
    {},
  ]),
};

const app = express();
app.use(express.json());
app.locals.connection = connection;
app.use(productRoutes(connection));

describe("GET /product-totals", () => {
  it("should return the total value of all products grouped by category", async () => {
    const res = await request(app)
      .get("/product-totals")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual([
      { category: "Electronics", total_value: 500 },
      { category: "Books", total_value: 200 },
      { category: "Food", total_value: 400 },
    ]);
    expect(connection.execute).toHaveBeenCalledWith(
      "SELECT category, SUM(price * quantity) AS total_value FROM products GROUP BY category"
    );
  });
});
