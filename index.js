require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns'); 
const urlParser  = require('url');
const bodyParser  = require('body-parser');
const {MongoClient} = require('mongodb');
const client = new MongoClient(process.env.urls);

const connect = async (url) => {
  try{
   await client.connect();

  }
  catch(err){
    console.log(err); 
  }
}
  const db = client.db("sample");
const collection = db.collection("urls"); 

 connect(); 
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: true}) );

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.get('/api/shorturl/:short_url', async (req , res ) =>{
  const short = +req.params.short_url; 
  let result = '';

  try{
     result = await collection.findOne({short_url: short   }); 
  }
  catch(err){console.log(err)};
  console.log(result);
  if(result){
  res.redirect(result.original_url); 
  }
  else{
    res.send("Not found");
  }
})

app.post('/api/shorturl', (req , res ) => {
    const url = req.body.url;
    const validate = dns.lookup(urlParser.parse(url).hostname,
    async (err , address) => {
      if(!address){
      res.json({error: "Invalid URL"});
    }
    else{
      try{
        const result = await collection.findOne({original_url: url}); 
        console.log(result);
        if(result){
          res.json({
            original_url: url,
            short_url: result.short_url
          })
        }
        else{
          const count = await collection.countDocuments(); 
          short = count +1 ; 
          const newUrl = {
            original_url: url, 
            short_url: short
          }
          await collection.insertOne(newUrl); 
          res.json({
            original_url: url,
            short_url: short
          }); 
        }
      }
      catch (err){conole.log(err)}; 
    }
  }
  )

} )

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
