// const bodyParser = require("body-parser");
const express = require("express");
const mongoDB = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const app = express();
var path = require("path");
var fs = require("fs");
app.use(cors());
// app.use(bodyParser);
app.use(express.json());

let db;
mongoDB.connect(
  "mongodb+srv://raja0sama:123asd@cluster0.ogsym.mongodb.net/test",
  (err, client) => {
    if (err) {
      console.log(err);
      return;
    }
    db = client.db("webstore");
  }
);

// Static file Serving from public folder
app.use(function (req, res, next) {
  filePath = path.join(__dirname, "public", req.url);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }
    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

// Logger Function
app.use((req, res, next) => {
  console.log("Incoming Request - ", {
    url: req.url,
    method: req.method,
    query: req.query,
    params: req.params,
    body: req.body,
    dateTime: new Date(),
  });
  next();
});

// Basic Route
app.get("/", (req, res, next) => {
  res.send("Hello Mom(world)");
});

// middleware to attach a db collection to req function.
app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(req.params.collectionName);
  next();
});

// Get all data from collection
app.get("/collection/:collectionName", (req, res, next) => {
  const collection = req.collection;

  // Integration of a search with query.
  const search = req?.query?.search;
  // Initalize the query to return all data.
  let q = {};
  if (search) {
    // If search is present, add a regex to the query.
    const [name, value] = search.split(":");
    const reg = new RegExp(value, "i");
    q = { [`${name}`]: { $in: [reg] } };
  }

  // Get the data from the collection.
  collection.find(q).toArray((err, docs) => {
    if (err) {
      res.send("Error");
    } else {
      res.send(docs);
    }
  });
});

// Add a data to a collection
app.post("/collection/:collectionName", (req, res, next) => {
  const collection = req.collection;
  // Insert the data into the collection.
  collection.insert(req.body, (err, result) => {
    if (err) {
      res.send("Error");
    } else {
      res.send(result);
    }
  });
});

// Update a data in a collection
app.put("/collection/:collectionName/:id", (req, res, next) => {
  // update the data in the collection.
  req.collection.update(
    { _id: new ObjectId(req.params.id) },

    { $set: req.body },

    { safe: true, multi: false },

    (e, result) => {
      if (e) return next(e);
      res.send(
        result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" }
      );
    }
  );
});

// Delete a data from a collection
app.delete("/collection/:collectionName/:id", (req, res, next) => {
  // Delete the data from the collection.
  req.collection.deleteOne(
    { _id: new ObjectId(req.params.id) },
    (e, result) => {
      if (e) return next(e);
      res.send(
        result.deletedCount === 1 ? { msg: "success" } : { msg: "error" }
      );
    }
  );
});

// If there is still any request with no handler, send 404
app.use(function (req, res) {
  // Sets the status code to 404
  res.status(404); // Sends the error "File not found!”
  res.send("File not found!");
});

// Start the server
app.listen(process.env.PORT || 3001, () => {
  console.log("Listening on port 3001");
});
