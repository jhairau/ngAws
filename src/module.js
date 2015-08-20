angular.module('ngAws', [])
    .provider('ngAwsConfig', function ngAwsConfigProvider() {

        // Base configuration
        this.config = {};

        // Merge in base options
        angular.extend(this, {

            // AWS Credentials
            credentials: {
                access_key: null,
                secret_key: null,
                session_token: null
            },

            // AWS region to default
            region: 'us-east-1',

            // AWS S3 bucket to default
            s3: {
                bucket: null
            }
        });


        var awsCredentials = new AWS.Credentials();


        /**
         * Set the AWS credentials
         * @param {string} access_key The AWS access key
         * @param {string} secret_key The AWS secret key
         * @params {string} session_token Unused
         */
        this.setCredentials = function (access_key, secret_key, session_token) {
            this.config.credentials.access_key = access_key;
            this.config.credentials.secret_key = secret_key;
            this.config.credentials.session_token = session_token | null;

            //awsCredentials = new A
        };


        this.getAwsCredentials = function () {
            return new AWS.Credentials({
                accessKeyId: this.config.credentials.access_key,
                secretAccessKey: this.config.credentials.secret_key,
                sessionToken: this.config.credentials.session_token
            });
        };

        this.getService = function (name, options) {

            // Base config for the service
            var config = {
                credentials: ngAwsConfig.getAwsCredentials()
            };

            // Merge in the user options
            angular.extend(config, options);

            return new AWS[name](config);
        };

        /**
         * Set the AWS Region to work with
         * @param {string} [region=us-east-1] Region code to work with
         */
        this.setRegion = function (region) {
            this.config.region = region;
        };


        /**
         * Set the AWS bucket in S3 to work out of
         * @param {string} bucket Name of the bucket to work out of
         */
        this.setBucket = function (bucket) {
            this.config.bucket = bucket;
        };


        /**
         * Required provider method for use in .config section of your app
         * @returns {{config: *}}
         */
        this.$get = function () {
            return {
                // Return the configuration
                config: this.config
            };
        };


        // Hardcode the apiVersions that we are going to be using
        AWS.config.apiVersions = {
            lambda: '2015-03-31',
            s3: '2006-03-01'
        };

        return this;
    })
;
