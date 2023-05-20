const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors({
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

const corsConfig = {
  origin: '',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))

app.use(express.json());



const uri = `mongodb+srv://toystars:${process.env.DB_PASS}@cluster0.yg6iolk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('toyDB').collection('toys');


    //Insert Operation
    app.post('/toys', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    })



    //Update Operation
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    app.put('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          toyName: updatedToy.toyName,
          sellerName: updatedToy.sellerName,
          sellerEmail: updatedToy.sellerEmail,
          toyPhotoURL: updatedToy.toyPhotoURL,
          category: updatedToy.category,
          price: updatedToy.price,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          details: updatedToy.details
        }
      }

      const result = await toysCollection.updateOne(filter, toy, options);
      res.send(result);
    })



    //Read Operation
    app.get('/alltoys', async (req, res) => {
      const searchQuery = req.query.search || ''; // Get the search query from request parameters
      const searchRegex = new RegExp(searchQuery, 'i'); // Create a case-insensitive regular expression for searching

      const query = { toyName: searchRegex }; // Add the search condition to the query
      const cursor = toysCollection.find(query).limit(20); // Limit the results to 20
      const result = await cursor.toArray();
      res.send(result);
    });


    //Logged in user specific email toy data's
    app.get('/toys', async (req, res) => {
      console.log(req.query.email);
      console.log(req.query.category);
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      }

      if (req.query?.category) {
        query = { category: req.query.category }
      }
      const sortField = req.query.sort || 'asc'; // Default to ascending order if no sort parameter is provided
      const sortOption = sortField === 'asc' ? 1 : -1;
      const result = await toysCollection.find(query).sort({ price: sortOption }).toArray();
      res.send(result);
    })


    //Delete Operation
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Toy Stars Server Is Running')
})

app.listen(port, () => {
  console.log(`Toy Server Is Running on PORT: ${port}`);
})