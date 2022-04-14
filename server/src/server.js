const express = require('express');
const slashes = require('connect-slashes');
const cors = require('cors');
const { LocalDB } = require('./db');

const PORT = process.env.PORT || 5000;

// Setting up the server
const app = express();
app.use(cors())
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 
app.use(slashes(false));
app.listen(PORT, () => console.log(`NFT marketplace server is up and running on port ${PORT}`));


// Setting DB
let db = new LocalDB('localdb.json');
let featuredDB = new LocalDB('featured.json');

app.post('/newnft', async (req, res) => {
  const { id } = req.body;
 
  if(!id)
    res.status(400).json({ message: "invalid id" });

  await db.createNewRecord(id)
  console.log(`Added id : ${id}`);
 
  res.status(200).json({ message: "New NFT ID added to the database successfully." });
})

app.post('/featureNft', async (req, res) => {
  const { id } = req.body;
 
  if(!id)
    res.status(400).json({ message: "invalid id" });

  await featuredDB.createNewRecord(id)
  console.log(`Featured id : ${id}`);
 
  res.status(200).json({ message: "NFT ID featured successfully." });
})

app.get('/explore/recent', async (req, res) => {
  res.json({
    recents: await db.getAllRecords()
  })
})

app.get('/explore/featured', async (req, res) => {
  res.json({
    recents: await featuredDB.getAllRecords()
  })
})

app.get('/responses/ping', (req, res)=>{
    res.status(200).send('-- ok --');
});

// 404 pages for development
app.get('*', (req, res)=>{
    res.status(404).send("API not found :(  <br> ¯\\_(ツ)_/¯");
});