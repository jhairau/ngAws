angular.module('ngAws')
    .service('ngAwsS3', function ngAws($log, ngAwsConfig) {

        /**
         * Get the S3 service object
         * @returns {*}
         */
        this.getService = function () {
            return new AWS.S3({
                credentials: ngAwsConfig.getAwsCredentials()
            });
        };

        /**
         * Method for checking through a nested list of options and returning error if one of the fail
         * @param requiredOptions
         * @returns {boolean}
         */
        this.checkOptions = function (requiredOptions) {
            var err = false;

            // Iterate over the required
            angular.forEach(requiredOptions, function (type, typeKey) {

                angular.forEach(type, function (key) {
                    if (angular.isUndefined(requiredOptions[typeKey][key])) {
                        $log.error('The option ' + typeKey + '.' + key + ' needs to be defined.');
                        err = true;
                    }
                });
            });

            return err;
        };


        //
        // --- Events ---- //
        //

        // Hash of events
        this.EVENTS = {
            USER_LOGIN_SUCCESS: 'ngAws:login_success',
            USER_LOGIN_ERROR: 'ngAws:login_error',
            USER_LOGOUT: 'ngAws:logout',

            USER_CREATED_SUCCESS: 'ngAws:user_created_success',
            USER_CREATED_ERROR: 'ngAws:user_created_error',
            USER_UPDATED: 'ngAws:user_updated',
            USER_LOADED_SUCCESS: 'ngAws:user_loaded_success',
            USER_LOADED_ERROR: 'ngAws:user_loaded_error'
        };


        /**
         * Generate an access policy for S3, this will allow us to HTTP Post files
         * @param conditions
         * @returns {{expiration: string, conditions: *[]}}
         */
        this.generatePolicy = function (conditions) {

            // TODO: Allow the user to specify how long they want the policy to last for.
            // TODO: Also allow the policy to be stored pulled from an external source and not genereated in the browser
            // Get the current date
            var _date = new Date();

            // Policy
            var s3Policy = {
                "expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours() + 1) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
                "conditions": [
                    {"bucket": ngAwsConfig.aws_bucket},
                    {"acl": "private"}
                ]
            };


            // TODO: initial implementation of merging in conditions
            angular.extend(s3Policy.conditions, [
                ["starts-with", "$key", "assets"], // TODO: this is currently hardcoded, remove
                ["starts-with", "$Content-Type", "image/"] // TODO: this is currently hardcoded, remove
            ]);


            // There are the user specified conditions
            angular.extend(s3Policy.conditions, conditions);

            return s3Policy;
        };


        /**
         * Return an encoded policy that is read for usage with the s3 api
         * @param {object} policyObject
         * @returns {string}
         */
        this.encodePolicy = function (policyObject) {
            // Get word Array
            var s3PolicyStrWords = CryptoJS.enc.Utf8.parse(JSON.stringify(policyObject));

            return CryptoJS.enc.Base64.stringify(s3PolicyStrWords);
        };


        /**
         * Sign a provided policy with the user secret and return
         * @param policy
         */
        this.signPolicy = function (policyEncoded) {
            return CryptoJS.HmacSHA1(policyEncoded, ngAwsConfig.aws_secret_key).toString(CryptoJS.enc.Base64);
        };


        /**
         * Get AWS ready credentials for consumption by AWS JS SDK
         * @returns {{access_key: *, policy: (*|string), signature, s3Bucket: *}}
         */
        this.getCredentials = function () {
            var myEncodePolicy = this.encodePolicy(this.generatePolicy());
            return {
                access_key: ngAwsConfig.aws_access_key,
                policy: myEncodePolicy,
                signature: this.signPolicy(myEncodePolicy),
                s3Bucket: ngAwsConfig.aws_bucket
            };
        };


        /**
         * Upload the provided object via the API and not a HTTP post
         * @param {File} file - File object
         * @param {Object} options - Object of options for storage
         */
        this.apiUpload = function (file, userOptions) {

            var options = {
                upload: {
                    partSize: 10 * 1024 * 1024, // How large should the chunks of the file be when uploading
                    queueSize: 1 // how many files / chunks will we process at once
                },
                storage: {
                    ACL: 'private' // Access Control
                }
            };

            // Merge in user provided options with the base options
            angular.extend(options.storage, userOptions.storage);


            //
            // ---- Simple Error Checking
            //
            var requiredOptions = {
                storage: [
                    'file',
                    'bucket',
                    'filepath'
                ],

                upload: [
                    'bucket',
                    'key',
                    'acl',
                    'contentType',
                    'buffer'
                ]
            };


            // Check if we have the required options
            if (!this.checkOptions(requiredOptions)) {
                return; // exit this method because we failed
            }

            // Get an instances of the S3 Factory with configuration provided
            var service = ngAwsConfig.getService('Lambda', {});


            // Required params for uploading an object to S3
            var uploadParams = {
                Bucket: options.upload.bucket, // the AWS S3 bucket where objects are to be stored
                Key: options.storage.filepath, // the full path within the bucket where the object will be stored
                ACL: options.upload.acl, // the Access Control for the object
                ContentType: options.upload.contentType, // The mimetype of the file
                Body: options.upload.buffer // The buffer for the file
            };


            // Upload in 10mb chunks
            var request = service.upload(uploadParams, {
                partSize: options.upload.partSize,
                queueSize: options.upload.queueSize
            }, function (err, data) {

                // error
                if (err) {
                    // Run if user has a callback for event:error
                    if (options.error) {
                        options.error.call(this, err);
                    }
                }

                // Success
                else {
                    // Run if user has a callback for event:success
                    if (options.success) {
                        options.success.call(this, data);
                    }
                }
            });

            // Run if user has a callback for event:progress
            if (angular.isFunction(options.progress)) {
                request.on('httpUploadProgress', function (progress) {
                    options.progress.call(this, progress);
                });
            }

            return true;
        };


        return this;
    })
;