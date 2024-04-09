const express = require("express");

module.exports = () => {
  const router = express.Router();

  // fetch all products
  router.get("/products", async (req, res) => {
    try {
      const connection = req.app.locals.connection;
      const [rows, fields] = await connection.execute("SELECT * FROM products");
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // fetch product by ID
  router.get("/products/:id", async (req, res) => {
    try {
      const connection = req.app.locals.connection;
      const [rows, fields] = await connection.execute(
        "SELECT * FROM products WHERE id = ?",
        [req.params.id]
      );
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // create new product
  router.post("/create-product", async (req, res) => {
    try {
      const connection = req.app.locals.connection;
      const { name, category, price, quantity } = req.body;
      const [result] = await connection.execute(
        "INSERT INTO products (name, category, price, quantity) VALUES (?, ?, ?, ?)",
        [name, category, price, quantity]
      );
      res.json({ id: result.insertId, name, price, quantity });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // update product
  router.put("/update-products/:id", async (req, res) => {
    try {
      const connection = req.app.locals.connection;
      const { name, price } = req.body;
      await connection.execute(
        "UPDATE products SET name = ?, price = ? WHERE id = ?",
        [name, price, req.params.id]
      );
      res.json({ id: req.params.id, name, price });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // delete product
  router.delete("/delete-products/:id", async (req, res) => {
    try {
      const connection = req.app.locals.connection;
      await connection.execute("DELETE FROM products WHERE id = ?", [
        req.params.id,
      ]);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //fetch total value of the products
  router.get("/product-totals", async (req, res) => {
    try {
      const connection = req.app.locals.connection;
      const [rows, fields] = await connection.execute(
        "SELECT category, SUM(price * quantity) AS total_value FROM products GROUP BY category"
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
