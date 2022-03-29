var bus = require('./event');
/**
 * msg_module_from  : module wich send the message_request
 * msg_module_to    : module to wich the message_request is sent
 * msg_UUID         : unique id of the message_request, the UUID is initiated by the sender. It is used the personified the answer
 * msg_topic        : string
 * msg_payload      : json object
 * msg_options      : [optional] json extra informations
 */
//bus.emit('message_request', msg_module_from, msg_module_to, msg_uuid,msg_topic,msg_payload,msg_options);


/** 
 * msg_module_from   : module wich sent the response
 * msg_module_to    : module to wich the message is sent
 * msg_uuid         : uuid of the msg_response. is the same as the uuid of the request
 * msg_response     : any. response object
*/
//bus.on('message_response', function(msg_module_from, msg_module_to, msg_uuid, msg_response){});

bus.on('message_request',function(msg_module_from, msg_module_to, msg_uuid,msg_topic,msg_payload,msg_options){
    let response = [];
    response.push(['tracker_request_msg_module_from',    msg_module_from]);
    response.push(['tracker_request_msg_module_to',      msg_module_to]);
    response.push(['tracker_request_msg_uuid',           msg_uuid]);
    response.push(['tracker_request_msg_topic',          msg_topic]);
    response.push(['tracker_request_msg_payload' ,       JSON.stringify(msg_payload)]);
    response.push(['tracker_request_msg_options',        JSON.stringify(msg_options)]);
    console.table(response);

});

bus.on('message_response', function(msg_module_from, msg_module_to, msg_uuid, msg_response){
    let response = [];
    response.push(['tracker_response_msg_module_from',       msg_module_from]);
    response.push(['tracker_response_msg_module_to',         msg_module_to]);
    response.push(['tracker_response_msg_uuid',              msg_uuid]);
    response.push(['tracker_response_msg_response',          JSON.stringify(msg_response)]);
    console.table(response);
})