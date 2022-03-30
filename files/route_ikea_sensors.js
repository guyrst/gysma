(async function(){
    try {
        var bus             = require('./event');
        const mongo         = require('./mongo');
        const f             = require('./functions');
        const mqtt          = require('./mqtt');
        const { v4: uuidv4 }= require('uuid');

        var params;
    
        bus.on('ikea(e1525/e1745)', function (topic,payload,tp) {
            if (!f.isJsonObject(payload)) {
                return;
            }   
            bus.emit('log', new Error('[silly] receiving topic: ' + topic + ', payload is: ' + JSON.stringify(JSON.parse(payload))));    
           var msg = JSON.parse(payload);
            //msg = JSON.parse('{"battery":60,"linkquality":123,"occupancy":false,"requested_brightness_level":null,"requested_brightness_percent":null,"update":{"state":"idle"},"update_available":false}');
            if (!(msg.occupancy == true || msg.occupancy == false)) {return;}
 
            (async function(){

                let scene_id = tp.alias_value + '/occupancy/' + msg.occupancy;
                bus.emit('log', new Error('[info] reading scene_id: ' + scene_id));   
                params = { "collection": "scenes", "filter": { "scene_id": scene_id } , "sort" : {"scene_id" : -1}, "limit" : 5} ;
                let doc = await mongo.read(params);
                if (doc.length == 0) {
                    bus.emit('log', new Error('[warning] no scene for: ' + scene_id));
                    return;
                }
                
                
                
                
                let scenes = doc[0].scene_items;
                if (scenes.length == 0) {
                    bus.emit('log', new Error('[warning] no items for scene: ' + scene_id));
                    return;
                }
                for (let i = 0; i< scenes.length; i++) {
                    let scene_item = scenes[i]
                    bus.emit('scenes_resolver',scene_item);

                }
                          
            })();

        }); 
    
    
    } catch(e) {
        console.log(e)}
    
    })();