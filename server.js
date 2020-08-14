var express= require("express");
var app=express();
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require('mongodb').ObjectID
var db=null;
var bodyparser=require('body-parser');
var jenkinsapi = require('jenkins-api')
var jenkins = jenkinsapi.init("http://gokul:Freakz@95@localhost:8080");
var waterfall = require('async-waterfall');
var Each=require('async-each');
//var range = require('node-range');
//var jsons=[];
//var forEach = require('async-foreach').forEach;

app.use(bodyparser.json());
app.use(express.static(__dirname+"/public"));

MongoClient.connect("mongodb://192.168.1.0/meeting",function(err,database){
   // console.log(err);
    db = database;
   // console.log(db);
});

app.use(express.static(__dirname + "/public"));
/*app.get("/stocks",function (req,res) {
    console.log(db);
    db.collection("cart1").find({}).toArray(function(err,doc){
        console.log(err);
        res.json(doc);
    });
});*/
app.get("/products",function (req,res) {
    console.log(db);
    db.collection("cart").find({}).toArray(function(err,doc){
        console.log(err);
        res.json(doc);
    });
});

app.post('/products',function(req,res){
    console.log(req.body);
    db.collection("cart").insertOne(req.body, function(err,doc){
      res.json(doc);
    });
});

app.delete("/products/:id",function(req,res){
  //  console.log(req.params.id+"fdfsffsd");
    var id=req.params.id;
    var myquery={_id: ObjectId(id)};
    db.collection("cart").deleteOne(myquery, function(err, doc) {
        res.json(doc);
    });

})

app.get("/products/:id",function (req,res) {
    console.log(req.params.id);
    var id=req.params.id;
    db.collection("cart").findOne({_id: ObjectId(id)},function(err, doc) {
           console.log(doc);
           res.json(doc);
    });

});
app.put("/products/:id",function (req,res) {
    console.log(req.body.name);
    var id=req.params.id;
    var myquery={_id:ObjectId(id)};
    var newvalues={name:req.body.name, price:req.body.price, qty:req.body.qty};
    db.collection("cart").updateOne(myquery,newvalues,function (err,doc) {
        console.log(doc);
        res.json(doc);
    })
});
/*app.post('/stocks',function(req,res){
    console.log(req.body);
    db.collection("cart1").insertOne(req.body, function(err,doc){
      res.json(doc);
      console.log(doc);
    });
});

app.delete("/stocks/:id",function(req,res){
  //  console.log(req.params.id+"fdfsffsd");
    var id=req.params.id;
    var myquery={_id: ObjectId(id)};
    db.collection("cart1").deleteOne(myquery, function(err, doc) {
        res.json(doc);
    });

})*/
// app.get("/jenkins/:name",function (req,res) {
//     console.log(req.params.name);
//     var name=req.params.name;
//     jenkins.all_builds(name,function(err, data) {
//       if (err){
//         return console.log(err);
//       }
//       console.log(data)
//       res.json(data);
//     });
// });


/*app.get("/jenkins",function (req,res) {
    jenkins.all_jobs(function(err, data) {
      if (err){
         return console.log(err);
       }
      console.log(data)
       res.json(data);
    });
});


app.get("/jenkins/:name",function (req,res) {
    console.log(req.params.name);
    var name=req.params.name;
    jenkins.last_build_info(name,function(err, data) {
      if (err){
        return console.log(err);
      }
      console.log(data)
      res.json(data);
    });
});

app.get("/jenkinsBuild/:name",function (req,res) {
    //console.log(req.params.name);
    var name=req.params.name.split(',')[0];
    var id=req.params.name.split(',')[1];
    console.log(name+id);
    jenkins.build_info(name, id,function(err, data) {
      if (err){
        return console.log(err);
       }
      console.log(data)
      res.json(data);
    });
});
*/
var array=[];
var l=0;
var builds;

app.get("/jenkins",function(req,res){
  var last=[];
waterfall([
  function(callback){
    console.log("First");
    jenkins.all_jobs(function(err,data){
      if(err){
        return console.log(err);
      }
    //  console.log(data);
        callback(null,data);

    })
  },
  function (jobs,callback){
        Each(jobs,function(item,next){
              console.log(item.name);
//              l=0;
                jenkins.last_build_info(item.name,function(err, data) {
                    if (err){
                        return console.log(err);
                        }
                        console.log("summa");
      console.log(data.id);
        //console.log(item.name);
                  array=[];
                  for(i=0;i<data.id;i++)
                  {
                    if(i<5){
                    array[i]=i;
                  }
                }


                                Each(array,function(index,next1){
                                 console.log(array);
                                            jenkins.build_info(item.name, (data.id-index),function(err, data) {
                                              if (err){
                                                return console.log(err);
                                              }

                                          //  console.log(data);

                                            builds={
                                              "name":item.name,
                                                "id":data.id,
                                                "duration":data.duration,
                                                "Result":data.result,
                                                "Timestamp":data.timestamp
                                              }

                                                last.push(builds);
                                              //console.log(last)
                                            next1();
                                          });
                              },function(err){
                            next();
                                  callback(null,last,jobs);
                              });
                            });

                  },function(err){
                  });
                }
          ],function(err,result,alljob){
            console.log("hi");
         console.log(result);
         console.log(alljob);
          res.json(result);
          });

 });

app.listen(3000);
console.log("Server working on port 3000");
