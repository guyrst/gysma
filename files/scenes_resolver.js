var bus             = require('./event');
const mongo         = require('./mongo');
const f             = require('./functions');
const mqtt          = require('./mqtt');
const { v4: uuidv4 }= require('uuid');
var client = {};

bus.on('mqtt_is_ready', function (return_key,mqtt_client,params) {
    if (return_key !== 'scenes_resolver') {return;}
    client = mqtt_client;
});







(async function(){
    try {
 
 
        var params;
    
        bus.on('scenes_resolver', function (scene) {
            
            (async function(){


                let alias = scene.split('/')[0];  
                // device document
                params = { "collection": "devices", "filter": { "alias": alias } , "sort" : {"alias" : -1}, "limit" : 5} ;
                let dev_docs = await mongo.read(params);
                if (dev_docs.length == 0) {
                    bus.emit('log', new Error('[verbose] did not find parasite device infos for: ' + JSON.stringify(params) ));
                    return;
                }
                bus.emit('log', new Error('[important] find device infos for: ' + JSON.stringify(params) ));
                let dev_doc = dev_docs[0];  
                
                params = { "collection": "scenes", "filter": { "scene_id": scene } , "sort" : {"scene" : -1}, "limit" : 5} ;
                let scene_docs = await mongo.read(params);
                if (scene_docs.length == 0) {
                    bus.emit('log', new Error('[verbose] did not find scene device infos for: ' + JSON.stringify(params) ));
                    bus.emit('log', new Error('[verbose] looking for generic scene device infos for: ' + JSON.stringify(params) ));
                    scene = scene.replace(alias,"(" + "generic" + ")");
                    params = { "collection": "scenes", "filter": { "scene_id": scene } , "sort" : {"scene" : -1}, "limit" : 5} ;
                   scene_docs = await mongo.read(params);
                   
                }
                bus.emit('log', new Error('[important] find device infos for: ' + JSON.stringify(params) ));
                let scene_doc = scene_docs[0];  
                scene_doc.mqtt.topic = scene_doc.mqtt.topic.replace('[prefix]',dev_doc.mqtt_prefix)
                                                           .replace('[fn]',dev_doc.fn);

                bus.emit('mqtt_publish',scene_doc.mqtt);

            })();
            
        
        });
            
 
       
    
    
        
    } catch(e) {
        console.log(e)
    }
    
    })();

async function emitscene(scene) {

    let alias = scene.split('/')[0];  
    // device document
    params = { "collection": "devices", "filter": { "alias": alias } , "sort" : {"alias" : -1}, "limit" : 5} ;
    let dev_docs = await mongo.read(params);
    if (dev_docs.length == 0) {
        bus.emit('log', new Error('[verbose] did not find parasite device infos for: ' + JSON.stringify(params) ));
        return;
    }
    bus.emit('log', new Error('[important] find device infos for: ' + JSON.stringify(params) ));
    let dev_doc = dev_docs[0];  
    
    params = { "collection": "scenes", "filter": { "scene_id": scene } , "sort" : {"scene" : -1}, "limit" : 5} ;
    let scene_docs = await mongo.read(params);
    if (scene_docs.length == 0) {
        bus.emit('log', new Error('[verbose] did not find scene device infos for: ' + JSON.stringify(params) ));
        bus.emit('log', new Error('[verbose] looking for generic scene device infos for: ' + JSON.stringify(params) ));
        scene = scene.replace(alias,"(" + "generic" + ")");
        params = { "collection": "scenes", "filter": { "scene_id": scene } , "sort" : {"scene" : -1}, "limit" : 5} ;
        return;
    }
    bus.emit('log', new Error('[important] find device infos for: ' + JSON.stringify(params) ));
    let scene_doc = scene_docs[0];  
    scene_doc.mqtt.topic = scene_doc.mqtt.topic.replace('[prefix]',dev_doc.mqtt_prefix)
                                               .replace('[fn]',dev_doc.fn);

    bus.emit('mqtt_publish',scene_doc.mqtt);


};







    var mqttparams =
        {
            "topic": "zigbee2mqtt/(Z_206_PC) prise de courant éclairage plan de travail laboratoire/set",
            "payload": {
                "state": "toggle"
            },
            "options" : {
                "qos" : 1,
                "retain" : false
            }
        };
    
        //bus.emit('scenes_resolver',"(Z_206_PC)/toggle");
    //bus.emit('mqtt_publish',mqttparams);
    //console.log('dd');