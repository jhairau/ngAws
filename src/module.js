angular.module('ngAwsS3', [])
    .provider('ngAwsS3Config', function ngAwsS3ConfigProvider() {

        // The base configuration
        var baseConfig = {

            aws_key: null,
            aws_secret: null,
            aws_region: null,
            s3_bucket: null


            templatePath: 'templates/bootstrap3'
        };


        /**
         * Set the entire config by merging objects
         * @param {[type]} object [description]
         */
        this.setConfig = function(object) {
            angular.extend(baseConfig, object);
        };


        /**
         * Get the entire config object
         * @return {[type]} [description]
         */
        this.getConfig = function() {
            return baseConfig;
        };


        /**
         * Get a single config value based on key
         * @return {[type]} [description]
         */
        this.getConfigValue = function(key) {
            return baseConfig[key];
        };


        /**
         * The required $get method
         * @return {[type]} [description]
         */
        this.$get = function() {

            return {
                get: this.getConfigValue
            };

        };

        return this;
    })
    .run(['$rootScope', '$state', 'ngAwsS3Config',
        function($rootScope, $state, ngAwsS3Config) {

          // run if we are routing
          if (ngAwsS3Config.get('routing')) {

            // On login, redirect the user to
            $rootScope.$on('ngAwsS3:login_success', function(event,authData) {
              $rootScope.authData = authData;

              if ($state.current.name == ngAwsS3Config.get('redirectPathLoggedOut')) {
                event.preventDefault();
                $state.go(ngAwsS3Config.get('redirectPathLoggedIn'));
              }
            });


            // Listen to routing errors
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, err) {

              // Auth error
              if (err == 'AUTH_REQUIRED') {

                // Stop any other routing actions from running
                event.preventDefault();

                // route the user to the login page
                $state.go(ngAwsS3Config.get('redirectPathLoggedOut'));
              }

            });
          }
        }
    ]);
