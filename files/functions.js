var bus                 = require('../files/event');
var fs                  = require('fs');
const { dirname }       = require('path');
const path              = require('path');
const moment            = require('moment');
var SunCalc             = require('suncalc');
const appDir            = dirname(require.main.filename);
let conf_id             = JSON.parse(fs.readFileSync(path.join(appDir, 'launch.json'))).conf_id;
const config            = JSON.parse(fs.readFileSync(path.join(appDir, 'launch.json')))[conf_id];
module.exports.config   = config;
module.exports.conf_id  = conf_id;

var solar_events         = [];
module.exports.solar_events = solar_events;

module.exports.busListeners = function(eventname, eventvalue) {
    let lmd = {}; lmd.text_color = this.text_color.FgYellow + this.text_color.Bright;
    bus.emit('log', new Error('[info] eventname: ' + eventname + ', event value:' + eventvalue),lmd);    
    let n = bus.listeners(eventname);
    if (n.length == 0) {
        bus.emit('log', new Error('[error] there is no listeners fo event: ' + eventname));
    } else if (n.length >1) {
        bus.emit('log', new Error('[warning] there are ' + n.length + ' listeners fo event: ' + eventname));  
    } else if (n.length==1) {
        bus.emit('log', new Error('[verbose] there is 1 listener fo event: ' + eventname)); 
    }
    return n;
};



/** REGEX comparing a value (string) to an array of string
 * true if hit, false otherwise
 */
module.exports.ismatching = function(value, list) {
    if (value == null) {value = 'texte'};
    if (list == null) {list = ['list1', 'list2', 'list3']};
    var retcode = false;
    var topicr = value.replaceAll('(','').replaceAll(')','').replaceAll(/\//g,'-').replaceAll(' ','');
    
    for (let item  of list) {
      var itemr = item.replaceAll('(','').replaceAll(')','').replaceAll(/\//g,'-').replaceAll(' ','');
      if (topicr.match(itemr)) {
          retcode = true;  
          break;
      }   
    };
    return retcode;
  };


  module.exports.text_color = {
    "Reset":       "\x1b[0m",
    "Bright":      "\x1b[1m",
    "Dim":         "\x1b[2m",
    "Underscore":  "\x1b[4m",
    "Blink":       "\x1b[5m",
    "Reverse":     "\x1b[7m",
    "Hidden":      "\x1b[8m",

    "FgBlack":     "\x1b[30m",
    "FgRed ":      "\x1b[31m",
    "FgGreen":     "\x1b[32m",
    "FgYellow":    "\x1b[33m",
    "FgBlue":      "\x1b[34m",
    "FgMagenta":   "\x1b[35m",
    "FgCyan":      "\x1b[36m",
    "FgWhite":     "\x1b[37m",

    "BgBlack":     "\x1b[40m",
    "BgRed":       "\x1b[41m",
    "BgGreen":     "\x1b[42m",
    "BgYellow":    "\x1b[43m",
    "BgBlue":      "\x1b[44m",
    "BgMagenta":   "\x1b[45m",
    "BgCyan":      "\x1b[46m",
    "BgWhite":     "\x1b[47m"
}


module.exports.lp = function(error_obj) {
    try {
        let x = {}; 
        //    x.message   = JSON.stringify(error_obj.message);
        //    x.stack     = JSON.stringify(error_obj.stack);
        //fs.writeFileSync("./json/log.json",error_obj);
    var fullpath        = error_obj.stack.split("at ")[1].trim();   //.split("(")[1].replaceAll(")","").trim() || 'undefined';
    var relativepath    = fullpath.substring(fullpath.lastIndexOf('/') + 1).trim();
    var modulename      = relativepath.substring(0,relativepath.indexOf('.')).trim();
    //var datestr         = new Date().toISOString().replace('T',' ').replace('Z',' ').trim();
    var datestr         = moment(new Date()).format('YYYY-MM-DD HH:MM:SS.mmm').toString()
    
    if (error_obj.message.indexOf(']') == -1 )
    {   
        var level = '[info]'; var message = error_obj.message.trim();
    } else {
        var level           = error_obj.message.substring(0,error_obj.message.indexOf(']')+1).trim();
        var message         = error_obj.message.replace(level,'').replace('[','').replace(']','').trim();
    }
    var stack = error_obj.stack;

    var stack_array = error_obj.stack.split('('); //console.log(stack_array);
    var stack_clean = [];
    for (let i = 0; i <= stack_array.length-1; i++) {
        try {
            let line = stack_array[i];
            if(line.indexOf('Error:') == 0){

            }
            else if (line.match('files') !== null){
            let clean = line.substring(0,line.indexOf('at')).replace(')','').trim();
            let file_id = clean.substring(clean.lastIndexOf('/files') + 1).trim();
            stack_clean.push(file_id);
        };    

        } catch(e) {
            console.log(e);
        }
    };
    var logtrace = JSON.stringify(stack_clean);
    var ret = (datestr  + ' ' + level.padEnd(12,' ') + ' ./' + relativepath).padEnd(82,' ') + message;
    var retobj = {
        "logstr"        : ret || 'undefined',
        "loglevel"      : level,
        "logmessage"    : message,
        "logstack"      : JSON.stringify(stack),
        "logtrace"      : stack_clean, //logtrace,
        "fullpath"      : fullpath,
        "relativepath"  : relativepath,
        "modulename"    : modulename,
        "datestr"       : datestr  
    };
    //fs.writeFileSync("./json/log.json",JSON.stringify(retobj));
    return retobj;
    } catch(e) {
        console.log(e.stack);
    }
};


module.exports.alias = function(line){
    var pos1 = line.indexOf('('); var pos2 = line.indexOf(')') ; 
    if (pos1 !== -1 & pos2 !== -1) {
        return line.substring(pos1,pos2 - pos1 +1).trim();
    } else {return null;}

};
/**
 * 
 * @param {*} topic 
 * @returns 
 */
module.exports.topic_parser = function(topic) {
    var slash1 = topic.indexOf('/');
    var slash2 = topic.lastIndexOf('/');
    var round1 = topic.indexOf('(');
    var round2 = topic.indexOf(')');
    var prefix = false; var prefix_value;
    var fn = false;     var fn_value;
    var suffix = false; var suffix_value;
    var alias = false;  var alias_value;
    if (slash1 == -1 &&  slash2 == -1 && round1 == -1 && round2 == -1){
        prefix = true; prefix_value = topic;
    }
    else if (slash1 == -1 &&  slash2 == -1 && round1 == 0 && round2  > round1){
        fn = true; fn_value = topic;
    }
    else if (slash1 > -1 &&  slash2 == slash1 && round1 == 0 && round2  > round1){
        fn = true; fn_value = topic.substring(0,slash1);
        suffix  = true;  suffix_value    = topic.substring(slash2+1);
    
    }
    else if (slash1 > -1 &&  slash2 == slash1) {  
        prefix  = true;  prefix_value    = topic.substring(0,slash1);
        fn      = true;      fn_value    = topic.substring(slash1+1);
    } 
    else if (slash1 > -1 &&  slash2 > slash1) {  
        prefix  = true;  prefix_value    = topic.substring(0,slash1);
        fn      = true;      fn_value    = topic.substring(slash1+1, slash2);
        suffix  = true;  suffix_value    = topic.substring(slash2+1);
    } 
    else if (slash1 != -1 && slash2 != -1) {
        prefix = true;  prefix_value    = topic.substring(0,slash1);
        fn = true;      fn_value        = topic.substring(slash1+1, slash2);
        suffix = true;  suffix_value    = topic.substring(slash2+1);
    }
    else {
        console.log('topic non traité:' + topic );

    }

    if (fn == true && round1 !== -1 && round2 > round1) {
        alias = true; alias_value = topic.substring(round1,round2+1) ;
    }

    var ret = {
        "topic" :       topic,
        "prefix":       prefix,
        "prefix_value": prefix_value,
        "fn":           fn,
        "fn_value":     fn_value,
        "suffix":       suffix,
        "suffix_value": suffix_value,
        "alias":        alias,
        "alias_value":  alias_value

    }
        return ret;
};
/**
 * 
 * @param {*} strData 
 * @returns 
 */
module.exports.isJsonObject = function(strData) {
    try {JSON.parse(strData);} catch (e) {return false;}return true;
};
/**
 * 
 * @param {sunrise, sunset} event_name 
 * @returns 
 */

module.exports.nextSolarEvent = function(event_name) {
    var lat = '43.95809377687287';
    var long = '4.429087084657054';
    
    var td          = new Date();
    var tm          = new Date();tm.setDate(tm.getDate()+1);
    var td_times    = SunCalc.getTimes(td, lat,long);
    var tm_times    = SunCalc.getTimes(tm, lat,long);
    solar_events = Object.keys(td_times);
    var phase = event_name;
    if (!phase) {return;}
    if (td_times[phase] < td) {
        return tm_times[phase];
    } else {
        return td_times[phase];
    }
};
module.exports.nextSolarEvent();

