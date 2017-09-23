var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var mongodb = require('mongodb');

var ObjectId = require('mongodb').ObjectID;
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+ process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
var Bing = require('node-bing-api')({accKey: process.env.ACCKEY});
var assert = require('assert');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('public'));

var mongodb = require('mongodb');
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

app.get('/api/:key', function(request, response){
  response.setHeader('Content-Type', 'application/json');
  var count= request.query.count;
  var offset = request.query.offset; 
  Bing.images(request.params.key, {
  count: count,   // Number of results 
  offset: offset    
  }, function(error, res, body){
    var bingData = [];
    for (var i = 0; i<count; i++)
    {bingData.push({url: body.value[i].webSearchUrl,
                    snippet: body.value[i].name,
                    thumbnail: body.value[i].thumbnailUrl,
                    context: body.value[i].hostPageDisplayUrl});}  
     response.send(JSON.stringify(bingData, null, 3));});});            
  
app.get('/', function(req, res){
   var searches = []; var searches2 = [];
   var MongoClient = require('mongodb').MongoClient;    
   MongoClient.connect(MONGODB_URI, function(err, db) {
   db.collection(process.env.COLLECTION1).find().toArray(function(err, result) {assert.equal(err, null); 
   if (result.length > 0) 
     {var initVal = result.length - 10; 
      var offset = 0;
      if (initVal <0)  {offset -= initVal; initVal = 0;}     
      for (var i = initVal; i<initVal + 10; i++) 
      {if (result[i]== undefined) {searches.push('');} else searches.push(result[i].searchVal);} 
      for (var i = 0; i<10; i++)  
      {if (searches[i] == '') {searches2[i]='';} else searches2[i] = searches[9-offset-i];}                                                                           
      res.render('home', {SearchData: {list: [searches2[0], searches2[1], searches2[2], searches2[3], searches2[4], searches2[5], searches2[6], searches2[7], searches2[8], searches2[9]]}});}
   else res.render('home', {SearchData: {list: ['', '', '', '', '', '', '', '', '', '']}});});
  db.close();});
});

app.post('/', function(request, response) {  
  var searchStr = request.body.searchStr;
  var count = parseInt(request.body.count);
  var offset = parseInt(request.body.offset);
  var Data = {  
      searchVal: searchStr,
      searchDate: new Date(),
      timestamp: true 
   };
   if (searchStr != '')
     {response.setHeader('Content-Type', 'application/json');
      var MongoClient = require('mongodb').MongoClient;    
      MongoClient.connect(MONGODB_URI, function(err, db) {
      db.collection(process.env.COLLECTION1).insertOne(Data, function(err, result) {assert.equal(err, null);})
      db.close();});
      Bing.images(searchStr, {count: count,   // Number of results
          offset: offset  
          }, function(error, res, body)
          {var bingData = [];
           for (var i = 0; i<count; i++)
              {bingData.push({url: body.value[i].webSearchUrl,
                              snippet: body.value[i].name,
                              thumbnail: body.value[i].thumbnailUrl,
                              context: body.value[i].hostPageDisplayUrl});}
      response.send(JSON.stringify(bingData, null, 3));});}
    else
      {var searches = []; var searches2 = [];
       var MongoClient = require('mongodb').MongoClient;    
       MongoClient.connect(MONGODB_URI, function(err, db) {
       db.collection(process.env.COLLECTION1).find().toArray(function(err, result) {assert.equal(err, null); 
       if (result.length > 0) 
         {var initVal = result.length - 10;
          var offset = 0;
          if (initVal <0) { offset -= initVal; initVal = 0;}                                                                          
          for (var i = initVal; i<initVal + 10; i++) 
          {if (result[i]== undefined) {searches.push('');} else searches.push(result[i].searchVal);} 
          for (var i = 0; i<10; i++) 
          {if (searches[i] == '') {searches2[i]='';} else searches2[i] = searches[9-offset-i];}                                                                           
          response.render('home', {SearchData: {list: [searches2[0], searches2[1], searches2[2], searches2[3], searches2[4], searches2[5], searches2[6], searches2[7], searches2[8], searches2[9]]}});}
       else response.render('home', {SearchData: {list: ['', '', '', '', '', '', '', '', '', '']}});});
       db.close();});} 
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
