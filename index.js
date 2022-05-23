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
    return res.status(401).send({ message: "Unauthorized Access" });
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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q4ici.mongodb.net/?retryWrites=true&w=majority`;
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
    const usersCollection = db.collection("usersCollection");
    const reviewsCollection = db.collection("reviewsCollection");
    const blogsCollection = db.collection("blogsCollection");

    //Verify Admin Role
    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "Forbidden" });
      }
    };

    //API to make Admin
    app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //API to get admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });
    //API to get all users
    app.get("/admin", async (req, res) => {
      const users = await usersCollection.find({}).toArray();
      res.send(users);
    });


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
      const options = { upsert: true };
      const updatedOrder = await ordersCollection.findOneAndUpdate(
        query,
        {
          $set: order,
        },
        options
      );
      res.send(updatedOrder);
    });

    //API to get orders by user email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const orders = await ordersCollection.find({ userEmail : email }).toArray();
      res.send(orders);
    });
    //API to get orders with multiple query parameters
    app.get("/orders/:email/:isdelivered", async (req, res) => {
      const email = req.params.email;
      const isdelivered = req.params.isdelivered;
      const orders = await ordersCollection.find({ userEmail : email, isDelivered : true }).toArray();
      res.send(orders);
    });

    //API to get all reviews
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsCollection.find({}).toArray();
      res.send(reviews);
    });

    //API to post a review
    app.post("/review", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const review = req.body;
        await reviewsCollection.insertOne(review);
        res.send(review);
      } else {
        res.send("Unauthorized access");
      }
    });

    //API to post a product
    app.post("/product", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const product = req.body;
        await toolsCollection.insertOne(product);
        res.send(product);
      } else {
        res.send("Unauthorized access");
      }
    });

    //API delete a product
    app.delete("/product/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const id = req.params.id;
        await toolsCollection.deleteOne({ _id: ObjectId(id) });
        res.send("Deleted");
      } else {
        res.send("Unauthorized access");
      }
    });

    //API to update a tool
    app.put("/product/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const id = req.params.id;
        const product = req.body;
        const options = { upsert: true };
        await toolsCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: product } ,
          options
        );
        res.send(product);
      } else {
        res.send("Unauthorized access");
      }
    });

    //API to get blogs

    app.get("/blogs", async (req, res) => {
      const query = {};
      const blogs = await blogsCollection.find(query).toArray();
      res.send(blogs);
    });
  } finally {
    // client.close();
  }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));
