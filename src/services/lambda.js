/**
 * @namespace ngAwsS3
 */

angular.module('ngAws')
    .service('ngAwsLambda', function ngAws($log, $q, ngAwsConfig) {

        /**
         * Get the Lambda service object
         * @returns {*}
         */
        this.getService = function () {
            return new AWS.Lambda({
                credentials: ngAwsConfig.getAwsCredentials()
            });
        };


        /**
         * Attempt to invoke a Lamda function and returns a promise
         * @see {@http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property}
         * @param {String} functionName
         * @param {string|Buffer} payload The data you are sending to the Lambda function
         * @param {string} [clientContext=null] Optional context for processing within your Lambda function
         * @param {string} [invocationType=Event] Optional the type of event
         * @param {string} [logType=None]
         * @returns {*}
         */
        this.invoke = function (functionName, payload, clientContext, invocationType, logType) {

            // Promise setup
            var defer = $q.defer();

            // Check for required params
            if (!functionName) {
                defer.reject("You cannot invoke a lambda function without a name");
                return;
            }

            // Lambda Service
            var service = this.getService();

            // Params for the request
            var params = {
                FunctionName: functionName,
                Payload: payload,
                ClientContext: clientContext | null,
                InvocationType: invocationType | 'Event', // 'Event | RequestResponse | DryRun
                LogType: logType | 'None' // 'None | Tail',
            };

            // Attempt to invoke the method
            service.invoke(params, function (err, data) {
                if (err) {
                    defer.reject(err); // reject due to error
                } else {
                    defer.resolve(data); // resolve
                }
            });

            // Return a promise, to be fulfilled
            return defer.promise;
        };


        return this;
    });