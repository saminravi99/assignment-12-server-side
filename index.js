const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q4ici.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("toolsDB");
    const toolsCollection = db.collection("toolsCollection");
    const ordersCollection = db.collection("ordersCollection");
    const userCollection = db.collection("userCollection");
    const reviewsCollection = db.collection("reviewsCollection");
    const blogsCollection = db.collection("blogs");

    //Authentication API

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // API to Run Server
    app.get("/", async (req, res) => {
      res.send("Manufacturer Server Running");
    });

    //API to get all tools
    app.get("/tools", async (req, res) => {
      const tools = await toolsCollection.find({}).toArray();
      res.send(tools);
    });

    ////API to get all orders
    app.get("/orders", async (req, res) => {
      const orders = await ordersCollection.find({}).toArray();
      res.send(orders);
    });

    //API to update a order
    app.put("/orders/:id", async (req, res) => {
      const orderId = req.params.id;
      const order = req.body;
      const query = { _id: ObjectId(orderId) };
      const updatedOrder = await ordersCollection.findOneAndUpdate(query, {
        $set: order,
      });
      res.send(updatedOrder);
    });

    //API to get orders by user email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const orders = await ordersCollection.find({ email }).toArray();
      res.send(orders);
    });


    
  } finally {
    // client.close();
  }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));