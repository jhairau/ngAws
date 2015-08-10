angular.module('ngAwsS3')
    .service('ngAwsS3Service', function ngAwsS3($rootScope, $q, ngAwsS3Config) {

        var self = this;


        //
        // --- Events ---- //
        //

        // Hash of events
        this.EVENTS = {
            USER_LOGIN_SUCCESS: 'ngAwsS3:login_success',
            USER_LOGIN_ERROR: 'ngAwsS3:login_error',
            USER_LOGOUT: 'ngAwsS3:logout',

            USER_CREATED_SUCCESS: 'ngAwsS3:user_created_success',
            USER_CREATED_ERROR: 'ngAwsS3:user_created_error',
            USER_UPDATED: 'ngAwsS3:user_updated',
            USER_LOADED_SUCCESS: 'ngAwsS3:user_loaded_success',
            USER_LOADED_ERROR: 'ngAwsS3:user_loaded_error'
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
                    {"bucket": ngAwsS3Config.aws_bucket},
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
         * @param policyObject
         * @returns {*|string}
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
            return CryptoJS.HmacSHA1(policyEncoded, ngAwsS3Config.aws_secret_key).toString(CryptoJS.enc.Base64);
        };


        /**
         * Get AWS ready credentials for consumption by AWS JS SDK
         * @returns {{access_key: *, policy: (*|string), signature, s3Bucket: *}}
         */
        this.getCredentials = function() {
            var myEncodePolicy = this.encodePolicy(this.generatePolicy());
            return {
                access_key: ngAwsS3Config.aws_access_key,
                policy: myEncodePolicy,
                signature: this.signPolicy(myEncodePolicy),
                s3Bucket: ngAwsS3Config.aws_bucket
            };
        };



        this.apiUpload = function() {
            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                credentials: new AWS.Credentials(user.AWS_KEY, user.AWS_SECRET),
                region: S3_REGION
            });
        };


        return this;
    });