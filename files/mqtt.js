
var bus             = require('./event');
var fs              = require('fs');
var f               = require('./functions');
const mqtt_config   = f.config.mqtt;
var mqtt            = require('mqtt');
const { v4: uuidv4 }= require('uuid');
var mqtt_client;
var mqtt_connection ;

bus.on('z2m_mqtt_is_ready', function () {
    client.subscribe(subscriptions.topics);            
    client.on('message', async function (topic, message, packet) { 
      let excluded = f.ismatching(topic,subscriptions.topics_exclusion_list);
      let included = f.ismatching(topic,subscriptions.topics_inclusion_list);  
      if (excluded == false || included == true) {
        bus.emit('log', new Error('[info] including ==> ' + topic ));   
        f.busListeners('z2m_mqtt_messages',topic);

        
        bus.emit('z2m_mqtt_messages', topic, message);
 
      } else {
        bus.emit('log', new Error('[warning] excluding ==> ' + topic ));  
      }      
    });   
});

/**
 * let params = {
 *  "topic"     : "topic to publish",
 *  "payload"   : "payload to publish",
 *  "options"   : {"qos" : 1 , "retain" : false}
 * };
 */
bus.on('mqtt_publish', function (params) {
    (async function(){
        //mqtt_client.publish("zigbee2mqtt/(Z_206_PC) prise de courant éclairage plan de travail laboratoire/set",'{"state" : "toggle"}');
        //return;
        // '{"state" : "toggle"}'
        let topic   = params.topic;
        let payload = JSON.stringify(params.payload);
        let options = JSON.stringify(params.options);
        let mqttparams = mqtt_config
        mqttparams.params.clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 8)
        let publish_client = await mqtt.connect(mqttparams.url,mqttparams.params,mqttparams.options);
        publish_client.on('connect', function (err) {
            let resp = publish_client.publish(topic,payload, options, function(err){
                console.log(err);
            })
            publish_client.end();
        });

    })();    
    
});


bus.on('XXXmqtt_publish_multiple', function (params) {
    (async function(){
        if (params.length == 0) {
            bus.emit('log', new Error('[warning] params.length == 0, no items to publish' ));   
        }
        let topic   = params.topic;
        let payload = JSON.stringify(params.payload);
        let options = JSON.stringify(params.options);
        let mqttparams = mqtt_config
        mqttparams.params.clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 8)
        let publish_client = await mqtt.connect(mqttparams.url,mqttparams.params,mqttparams.options);
        publish_client.on('connect', function (err) {
            let resp = publish_client.publish(topic,payload, options, function(err){
                console.log(err);
            })
            publish_client.end();
        });
    


    })();    
});



module.exports.getClient = async function(return_key,params) {
    if (!params) {params = mqtt_config;}
    if (!return_key) {return_key = 'start_up'}
    
    params.params.clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 8);
    mqtt_client = await mqtt.connect(params.url,params.params,params.options);
    mqtt_client.on('connect', function () {
        mqtt_connection = mqtt_client;
        bus.emit('log', new Error('[info] Connected successfully to MQTT server:  ' + params.url  + ', clientId is: ' + mqtt_client.options.clientId + ', return_key is: ' + return_key));
        f.busListeners('mqtt_is_ready');
        bus.emit('mqtt_is_ready', return_key,mqtt_client,params); 
        if (return_key == 'start_up') {mqtt_client.end()};
    });
};

module.exports.getMyClient = async function(return_key,params) {
    if (!params) {params = mqtt_config;}
    if (!return_key) {return_key = 'start_up'}
    let myMqtt = require('mqtt');
    
    params.params.clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 8);
    //(async function(){
        let myMqttClient = myMqtt.connect(params.url,params.params,params.options, function(err){
            if (err) {
                console.log(err)}       
        });
    //})();
    myMqttClient.on('connect', function (err) {
        if (err) {
            console.log(err)}
        return myMqttClient;
    });
};




(async function() {
    var params =  {
        "url" : "mqtt://mqtt.local:1883",
         "params" : {
              "clientId" : "mqttjs_edfgbnyyyy",
              "username" : "mqttadmin",
              "password" : "444NFGL8",
              "clean"    : true
          },
          "options" : {
              "qos" : 1,
              "retain" : false
          }
};




})();


module.exports.getClient('mqtt_publish_client');
bus.on('XXXmqtt_is_ready', function(return_key,mqtt_client,params) {
    if (return_key !== 'mqtt_publish_client') {return;}
    var mqtt_publish_client = mqtt_client;
    bus.on('mqtt_publish', function (params) {
        let topic   = params.topic;
        let payload = params.payload;
        let options = params.options;
        let resp = mqtt_publish_client.publish("zigbee2mqtt/(Z_206_PC) prise de courant éclairage plan de travail laboratoire/set",
                                            '{"state" : "toggle"}', function(err){
            console.log(err);
        })
    });
})

module.exports.getClient() ;
