
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
const AWS = require('aws-sdk');

// Consts
const PLUGIN_NAME = 'gulp-aws-codedeploy';

var codedeploy = null;

// Plugin level function(dealing with files)
function codeDeploy(params) {

	console.log('code deploy');

	// Creating a stream through which each file will pass
	return through.obj(function(file, enc, cb) {

	console.log("* file: ", file)
	console.log("* enc: ", enc)

    if (file.isNull()) {
      return cb();
    }

    if (file.isStream()) {
		this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Stream content is not supported'));
		return cb();    
  	}

    if (file.isBuffer()) {

		// create deployer
	    if (!codedeploy) {
	    	codedeploy = new AWS.CodeDeploy({region : 'eu-west-1'});
	    }

		codedeploy.createDeployment(params, function(err, data) {
			cb(err, file);
		});
    }

    cb(null, file);

  });
}

module.exports = codeDeploy;