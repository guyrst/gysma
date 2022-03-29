try {

    var   bus               = require('./files/event');
    var   fs                = require('fs');
    var   path              = require('path');
    var   f                 = require('./files/functions');
    var thismodule          = 'index';
    const { dirname }       = require('path');
    const appDir            = dirname(require.main.filename);
    let conf_id             = JSON.parse(fs.readFileSync(path.join(appDir, 'launch.json'))).conf_id;



    bus.on('log', function (log_object,lmd) {
      if (!lmd) {lmd = {}, lmd.display=true}
      else if (!lmd.display) {lmd.display = true};
      
      if (lmd.display = false) {return;}
      
      let log_parser = f.lp(log_object);
      let log_text =  f.lp(log_object).logstr ;

      if (!lmd.text_color){
          if      (log_text.indexOf('[verbose]')      >= 0) { lmd.text_color = f.text_color.FgBlue }
          else if (log_text.indexOf('[warning]')      >= 0) { lmd.text_color = f.text_color.FgMagenta + f.text_color.Dim }
          else if (log_text.indexOf('[error]')        >= 0) { lmd.text_color = f.text_color['FgRed '] + f.text_color.Bright}
          else if (log_text.indexOf('[silly]')        >= 0) { lmd.text_color = f.text_color.FgBlue + f.text_color.Dim}
          else if (log_text.indexOf('[info]' )        >= 0) { lmd.text_color = f.text_color.FgBlue + f.text_color.Bright}
          else if (log_text.indexOf('[important]' )   >= 0) { lmd.text_color = f.text_color.FgGreen  + f.text_color.Bright}
          else {lmd.text_color = f.text_color.BgWhite + f.text_color.FgCyan + f.text_color.Bright}
      }
      log_text = lmd.text_color + log_text + f.text_color.Reset;
      console.log(log_text);
    });

    bus.emit('log', new Error('[info] application starts')); 
    bus.emit('log', new Error('[info] configuration is: ' + conf_id));
    require('./files/start')

} catch (e) {
  console.log(e);
}



