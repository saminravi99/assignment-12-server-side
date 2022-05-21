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

//API to get all orders
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
    await toolsCollection.updateOne({ _id: ObjectId(id) }, { $set: product });
    res.send(product);
  } else {
    res.send("Unauthorized access");
  }
});
