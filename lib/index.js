const url = require('url');
const through = require('through2');
const gutil = require('gulp-util');
const AWS = require('aws-sdk');
const s3fs = require('s3-fs');

// Consts
const PLUGIN_NAME = 'gulp-aws-codedeploy';

var codedeploy = null;

/**
 * MAIN
 */
function codeDeploy (codedeployParams, s3Root) {

  console.log('** codedeployParams', this.codedeployParams);

  // Creating a stream through which each file will pass
  return through.obj(function (file, enc, cb) {

    if (!codedeployParams) {
      return emitError(this, 'Missing codedeploy parameters object', cb);
    }

    if (!s3Root) {
      return emitError(this, 'Missing s3Root parameter (string)', cb);
    }

    if (file.isNull()) {
      return emitError(this, 'Input is null. Not implemented', cb);
    }

    if (file.isDirectory()) {
      return emitError(this, 'Input is a directory. Not implemented', cb);
    }

    if (!file.isStream() && !file.isBuffer()) {
      return emitError(this, 'Input must be Stream of Buffer.', cb);
    }

    // create target filename
    const targetFilename = s3Root + '/' + file.basename;

    // S3 write STREAM
    const s3Stream = s3fs.createWriteStream(targetFilename, function (err, result) {

      if (err) {
        return emitError(_this, 'Could not upload ' + file.path + ' to ' + targetFilename, cb);
      }

      // add s3 parameters to codedeploy params
      const urlparsed = url.parse(targetFilename);

      // clone
      var myCodedeployParams = { codedeployParams }.codedeployParams;
      myCodedeployParams.revision = {
        revisionType: 'S3',
        s3Location: {
          bucket: urlparsed.host,
          bundleType: file.extname.substring(1),
          key: urlparsed.pathname.substring(1)
        }
      };

      // create deployer
      if (!codedeploy) {
        codedeploy = new AWS.CodeDeploy({ region: myCodedeployParams.region || 'eu-west-1' });
      }

      delete myCodedeployParams.region;

      // deploy
      codedeploy.createDeployment(myCodedeployParams, function (err, data) {
        console.log(data);
        cb(err, file);
      });
    });

    // pipe file
    file.pipe(s3Stream);
  });
}

/**
 * emitError
 */
function emitError (_this, message, cb) {
  _this.emit('error', new gutil.PluginError(PLUGIN_NAME, message));
  return cb(new Error(message));
};

module.exports = codeDeploy;
