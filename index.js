const { connectToMongo } = require("./db");
const express = require("express");
const app = express();
const port = 3000;

connectToMongo();

app.get("/", (req, res) => {
  res.send("Hello Shital!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}.`);
});
