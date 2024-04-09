require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(express.json());
app.use("/", productRoutes());

mysql
  .createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true,
      ...(process.env.CA_CERT_PATH && {
        ca: require("fs").readFileSync(process.env.CA_CERT_PATH),
      }),
    },
  })
  .then((connection) => {
    console.log("Successfully connected to MySQL database!");
    app.locals.connection = connection;
    productRoutes(app);

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Something broke!");
    });

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  });
