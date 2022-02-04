// const bodyParser = require("body-parser");
const express = require("express");
const mongoDB = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const app = express();
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

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });

app.get("/", (req, res, next) => {
  return res.send("Select a collection");
});

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(req.params.collectionName);
  next();
});

app.get("/collection/:collectionName", (req, res, next) => {
  const collection = req.collection;

  collection.find({}).toArray((err, docs) => {
    if (err) {
      res.send("Error");
    } else {
      res.send(docs);
    }
  });
});
app.post("/collection/:collectionName", (req, res, next) => {
  const collection = req.collection;

  collection.insert(req.body, (err, result) => {
    if (err) {
      res.send("Error");
    } else {
      res.send(result);
    }
  });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.update(
    { _id: new ObjectId(req.params.id) },

    { $set: req.body },

    { safe: true, multi: false },

    (e, result) => {
      console.log({ e });
      if (e) return next(e);
      console.log({ result });
      res.send(
        result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" }
      );
    }
  );
});

app.delete("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.deleteOne(
    { _id: new ObjectId(req.params.id) },
    (e, result) => {
      console.log({ e });
      if (e) return next(e);
      console.log({ result });
      res.send(
        result.deletedCount === 1 ? { msg: "success" } : { msg: "error" }
      );
    }
  );
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Listening on port 3001");
});
