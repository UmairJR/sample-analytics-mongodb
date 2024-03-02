const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();

const port = 5000;

const uri = "mongodb+srv://vishnu-assignment:wyfMu8kwtKfQLTkF@cluster0.cy2y5l5.mongodb.net/sample_analytics?retryWrites=true&w=majority&appName=Cluster0";


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
}
connectToMongoDB();
// Create a simple schema for customers
// const customerSchema = new mongoose.Schema({
//   username: String,
//   name: String,
//   address: String,
//   birthdate: Date,
//   email: String,
//   active: Boolean,
//   accounts: [Number],
//   tier_and_details: Object,
// });

// const Customer = mongoose.model('Customer', customerSchema);

app.use(cors());
app.use(express.json());



app.get('/api/active-customers', async (req, res) => {
    try {
        const activeCustomers = await client.db().collection('customers').find({ active: true }).toArray();
        console.log('Active Customers:', activeCustomers);
        return res.json(activeCustomers);
    } catch (error) {
        console.error('Error fetching active customers:', error.message);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/get-transaction', async (req, res) => {
    try {
        const accountId = parseInt(req.query.account_id, 10);
        console.log('Received account_id:', accountId);

        const transaction = await client.db().collection('transactions').findOne({ account_id: accountId });
        console.log('Transaction:', transaction);

        return res.json(transaction);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/low-amount-accounts', async (req, res) => {
    try {
      const accounts = req.body.accounts;
      console.log(accounts);
  
      const filteredAccounts = [];
  
      for (const account of accounts) {
        const lowAmountAccounts = await client
          .db()
          .collection('transactions')
          .aggregate([
            {
              $match: {
                account_id: account,
                "transactions": {
                    $elemMatch: {
                      "amount": { $lt: 5000 }
                    }
              }
            }
            },
            {
              $group: {
                _id: null,
                account_id: { $first: '$account_id' }
              }
            },
            {
              $project: {
                _id: 0,
                account_id: 1
              }
            }
          ])
          .toArray();
  
        if (lowAmountAccounts.length > 0) {
          filteredAccounts.push(account);
        }
      }
      return res.json(filteredAccounts);
    } catch (error) {
      console.error('Error fetching low amount accounts:', error.message);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/distinct-products', async (req, res) => {
    try {
      const disntinctProducts = await client.db().collection('accounts').aggregate([
        {
          $unwind: '$products',
        },
        {
          $group: {
            _id: null,
            distinctProducts: { $addToSet: '$products' },
          },
        },
        {
          $project: {
            _id: 0,
            distinctProducts: 1,
          },
        },
      ]).toArray();
  
      return res.json(disntinctProducts);
    } catch (error) {
      console.error('Error fetching distinct products:', error.message);
      res.status(500).json({ message: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
