const { MongoClient }   = require('mongodb');
var bus                 = require('../files/event');
var thismodule          = 'mongo';
var f                   = require('../files/functions');
const mongo_conf        =  f.config.mongo;
const { v4: uuidv4 }    = require('uuid');
var mongo_conn;
// Create a MongoDB connection pool and start the application
// after the database connection is ready
MongoClient.connect(mongo_conf.url, (err, db) => {
    if (err) {
      logger.warn(`Failed to connect to the database. ${err.stack}`);
    }
    mongo_conn = db;
    module.exports.connection = db;
    bus.emit('test_mongo',{"once" : true})
    //app.listen(config.port, () => {
    //  logger.info(`Node.js app is listening at http://localhost:${config.port}`);
    //});
});

bus.on('test_mongo', function(){
    bus.emit('log', new Error('[info] testing mongodb CRUD opérations '));
    
    let params = {
        "db"          : "gysma",
        "collection"  : "test",
        "filter"      : {"alias" : "test_crud_updateOne"},
        "values"      : {"val1" : "string", "val2" : 2, "val3" : true, "timestamp" : new Date().toISOString()},
        "options"     : {"upsert" : true}
    };
    (async function(){
        let results = await module.exports.updateOne(params, mongo_conn);
        console.table(results);
    })();
       
    params = {
        "db"          : "gysma",
        "collection"  : "devices",
        "filter"      : {"alias" : "(Z_201_DP)"},
        "sort"        : {"alias" : -1},
        "limit"       : 100
    };
    (async function(){
        let results = await module.exports.read(params, mongo_conn);
        console.table(results);
    })();

    params = {
        "db"          : "gysma",
        "collection"  : "test",
        "filter"      : {"alias" : "test_crud_updateOne"}
    };
    (async function(){
        let results = await module.exports.deleteOne(params, mongo_conn);
        console.table(results);
    })();

    bus.emit('mongo_is_ready',{"once" : true})
 
}); 

module.exports.updateOne = async function(params, client) { 
    if (!client) {client = mongo_conn;}
    if (!params.db) {params.db = "gysma";}
    const results = await client.db(params.db)
        .collection(params.collection)
        .updateOne(params.filter,{ $set : params.values, $currentDate: { "lastModified": true }},params.options);
    
    return results;
  };

module.exports.read = async function(params, client) { 
    if (!client) {client = mongo_conn;}
    if (!params.db) {params.db = "gysma";}
    if (!params.sort) {params.sort = {}};
    if (!params.limit) {params.limit = 100};
    const wm1 = await client.db(params.db);
    const wm2 = await wm1.collection(params.collection);
    const wm3 = await wm2.find(params.filter);
    const wm4 = await wm3.sort(params.sort);
    const cursor = await wm4.limit(params.limit);
    
    //const cursor = client.db(params.db).collection(params.collection)
    //    .find(params.filter)
    //    .sort(params.sort)
    //    .limit(params.limit);

    // Store the results in an array
    const results = await cursor.toArray();
    return results;
  };

  module.exports.deleteOne = async function(params, client) { 
    if (!client) {client = mongo_conn;}
    if (!params.db) {params.db = "gysma";}
    const results = await client.db(params.db)
        .collection(params.collection)
        .deleteOne(params.filter);
    return results;
  };


  bus.on('message_request',function(msg_module_from, msg_module_to, msg_uuid,msg_topic,msg_payload,msg_options){
    if(msg_module_to !== thismodule) {return;}

});
