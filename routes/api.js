

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var aqp = require('api-query-params');
require('dotenv').config();
const requestIp = require('request-ip');



const CONNECTION_STRING = process.env.DB; 

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      let stock=req.query.stock;
      const clientIp = requestIp.getClientIp(req); 
     

      MongoClient.connect(CONNECTION_STRING, (err, dbo)=>{
        if(err) return console.log(err);
        let db = dbo.db('test');

        //check if only one stock is provided
        if (typeof(stock)=='string'){
          stock = req.query.stock.toUpperCase();
            
          //  if(req.query.like){
          //    db.collection('stocks').findOne({symbol: stock},(err, doc)=>{
          //      if(doc.ip.includes(clientIp)){ return; }
          //      else{
          //        db.collection('stocks').update({symbol: stock}, { $push: {ip : clientIp}, $inc: {likes: 1} }) 
          //        }
          //    } )
                
          //    }

              db.collection('stocks').find({ symbol: stock }).toArray((err, data)=>{
               // console.log(data)
                if(err) return console.log(err);
                let new_data =[];
                data.map((doc)=>{ 
                  let id = doc._id;
                let sstock = doc.symbol;
                let price = doc.latestPrice;
               // let likes =doc.likes;
                  new_data.push({ stock: sstock, price: price })
                });
              //  res.send(JSON.stringify(data[0], undefined, 4));
              res.json(data[0]);
              })

        //rnd if string
      }
      //check if 2 stocks are provided
      else if( typeof(stock)=='object' ){
        // if(req.query.like){
        //   stock.map( (elem) => {
        //   db.collection('stocks').findOne({symbol: elem},(err, doc)=>{
        //     if(doc.ip.includes(clientIp)){ return; }
        //     else{
        //       db.collection('stocks').update({symbol: elem}, { $push: {ip : clientIp}, $inc: {likes: 1} }) 
        //       }
        //   } )
        // })
        //   //end like handler   
        //   }
         
        var stock1 = stock[0].toUpperCase();
        var stock2  = stock[1].toUpperCase();
    
        db.collection('stocks').find( { $or:[{ symbol: stock1}, { symbol: stock2 }] }).toArray((err, data)=>{
          if(err) return console.log(err);
          console.log(data);
          let new_data = [];
          data.map((doc)=>{ 
            let id = doc._id;
          let sstock = doc.symbol;
          let price = doc.latestPrice;
          // let likes =doc.likes;
            new_data.push({ stock: sstock, price: price })
          });
          // let x = new_data[0].likes - new_data[1].likes;
          // let y = new_data[1].likes - new_data[0].likes;
          // new_data[0].likes = x;
          // new_data[1].likes = y;
          res.json(new_data);
        })

    //end if stock object  
    }

        //end db
      })
      
    });


    //another route for adding data, Internal use, Not for Test.. don't use it
    app.route('/add')
    .get(function (req, res){
      let stock = aqp(req.query);
      console.log(stock);

      MongoClient.connect(CONNECTION_STRING, (err, dbo)=>{
        if(err) return console.log(err);
        let db = dbo.db('test');
        let dat = require("../stocks");
        console.log(dat);
        dat.map( (element)=>{ db.collection('stocks').insertOne(element, ()=>{ res.type('text').send('Added') }); 
        }) 

        //end db
      })
      
    });
    
};
