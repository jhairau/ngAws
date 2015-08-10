angular.module('ngFirebaseUser')
	.service('ngFirebaseUserUser', function ngFirebaseUserUser($rootScope, $q, ngFirebaseUserConfig, $firebaseAuth, $firebaseObject) {

		var self = this;
		var unbindUser = null;


		/**
		 * Firebase reference for app
		 * @type {Firebase}
		 */
		var appRef = new Firebase(ngFirebaseUserConfig.get('firebaseUrl'));


		/**
		 * Firebase reference for the current user
		 * @type {[type]}
		 */
		var usersRef = appRef.child(ngFirebaseUserConfig.get('firebaseUserPath'));


		/**
		 * Firebase object for authorisation
		 * @type {[type]}
		 */
		var authObj = $firebaseAuth(appRef);



		//
		// --- Events ---- //
		//

		// Hash of events
		this.EVENTS = {
			USER_LOGIN_SUCCESS: 'ngFirebaseUser:login_success',
			USER_LOGIN_ERROR: 'ngFirebaseUser:login_error',
			USER_LOGOUT: 'ngFirebaseUser:logout',

			USER_CREATED_SUCCESS: 'ngFirebaseUser:user_created_success',
			USER_CREATED_ERROR: 'ngFirebaseUser:user_created_error',
			USER_UPDATED: 'ngFirebaseUser:user_updated',
			USER_LOADED_SUCCESS: 'ngFirebaseUser:user_loaded_success',
			USER_LOADED_ERROR: 'ngFirebaseUser:user_loaded_error'
		};


		// Trigger on Firebase authorisation events
		authObj.$onAuth(function(authData) {
			if (authData) {

				// Broadcast login success
				$rootScope.$broadcast(self.EVENTS.USER_LOGIN_SUCCESS, authData);

				// push the authData to rootScope
				$rootScope.authData = authData;

				// Load the user
				self.loadUser(authData.uid);
			} else {

				// Broadcast logout success
				$rootScope.$broadcast(self.EVENTS.USER_LOGOUT);

				// Unbind the user object
				if (typeof unbindUser == 'function') {
					unbindUser();	
				}
			}
		});


		/**
		 * Method to load the user
		 * @param  {[type]} uid [description]
		 * @return {[type]}     [description]
		 */
		this.loadUser = function(uid) {
			var userObject = $firebaseObject(usersRef.child(uid));

			// Run when user is loaded
			userObject.$loaded()
				.then(function(data){
					// Broadcast user is loaded successfully
					$rootScope.$broadcast(self.EVENTS.USER_LOADED_SUCCESS);
				})
				.catch(function(err){
					// Broadcast user is not loaded successfully
					$rootScope.$broadcast(self.EVENTS.USER_LOADED_ERROR);	
				});
			
			// Bind the user data to the rootScope based on the config
			userObject.$bindTo($rootScope, ngFirebaseUserConfig.get('angularUserNamespace'))
				.then(function(unb) {
					unbindUser = unb;
				});
		};


		//
		// ---- Login Methods ---- //
		//
		
		/**
		 * Login a user via email and password, return promise
		 * @param  {[type]} email    [description]
		 * @param  {[type]} password [description]
		 * @return {[promise]}          [description]
		 */
		this.loginEmail = function(email, password) {
			var def = $q.defer();

			authObj.$authWithPassword({
				email: email,
				password: password
			}).then(function(authData){
				def.resolve(authData.uid); // return the user id
			}).catch(function(error) {
				def.reject(error); // return the error
				$rootScope.$broadcast(self.EVENTS.USER_LOGIN_ERROR); // broadcast the error
			});

			return def.promise;
		};


		/**
		 * Logout the current user from Firebase
		 *
		 * If successful it will trigger the event ngFirebaseUser:logout or
		 * ngFirebaseUser:logout_fail if error
		 * @return {void} [description]
		 */
		this.logout = function() {
			authObj.$unauth();

			return null;
		};


		//
		// ---- Managment ---- //
		//

		/**
		 * Change the password for the user requiring their email,
		 * old password and new password.
		 * 
		 * You should make sure that they write their new password twice
		 * so that they don't submit an incorrect password.
		 * 
		 * @param  {[type]} email       [description]
		 * @param  {[type]} oldPassword [description]
		 * @param  {[type]} newPassword [description]
		 * @return {[type]}             [description]
		 */
		this.changePassword = function(email, oldPassword, newPassword) {
			authObj.$changePassword({
				email: email,
				oldPassword: oldPassword,
				newPassword: newPassword
			}).then(function() {
				console.log("Password changed successfully!");
			}).catch(function(error) {
				console.error("Error: ", error);
			});
		};


		/**
		 * Request Firebase to send a password reset email to the specified email
		 * returns a promise
		 * @param  {[type]}   email    [description]
		 * @return {promise}            [description]
		 */
		this.sendPasswordResetEmail = function(email) {
			return authObj.$resetPassword({
				email: email
			});
		};


		/**
		 * Change the registered email address for the user
		 * @param  {[type]} oldEmail [description]
		 * @param  {[type]} newEmail [description]
		 * @param  {[type]} password [description]
		 * @return {[promise]}          [description]
		 */
		this.changeEmail = function(oldEmail, newEmail, password) {
			return authObj.$changeEmail({
				oldEmail: oldEmail,
				newEmail: newEmail,
				password: password
			});
		};


		// TODO: restrict to ADMIN
		/**
		 * Create a user
		 * @param  {[type]} email    [description]
		 * @param  {[type]} password [description]
		 * @return {[type]}          [description]
		 */
		this.createUser = function(email, password) {
			return authObj.$createUser({
				email: email,
				password: password
			});
		};



		//
		// --- Resolve methods for Controllers
		//


		/**
		 * Promise that returns the current auth state for the user
		 * @return {[type]} [description]
		 */
		this.waitForAuth = function() {
			return authObj.$waitForAuth();
		};


		/**
		 * Promise that rejects if user is not authed
		 * @return {[type]} [description]
		 */
		this.requireAuth = function() {
			return authObj.$requireAuth();
		};

		return this;
	});