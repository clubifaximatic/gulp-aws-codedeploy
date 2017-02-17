
# gulp-aws-codedeploy

AWS codedeploy plugin for gulp

Upload file to S3 and then deploy it using AWS Codedeploy

# Example


```js
// codedeploy parameters
const parameters =   {
  "applicationName": "my-webserver",
  "deploymentConfigName": "CodeDeployDefault.AllAtOnce",
  "deploymentGroupName": "my-group",
  "description": "my-description",

  "region": "eu-west-1"
};

// deploy
return gulp.src([
    'app/**/*'
  ])
  .pipe(zip('target/app.zip'))
  .pipe(codedeploy(parameters, 's3://mybucket/target_dir'))
  .on('error', gutil.log);
});
```

The previus example creates a zip with all the files found in the directory `app` then upload the zip file to `s3://mybuclet/target_dir/app.zip` and call `codedeploy` with the passed parameters

In the parameters we can specify the `region` if none specified, eu-west-1 is used by default
