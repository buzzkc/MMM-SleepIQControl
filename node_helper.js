/* Magic Mirror
 * Node Helper: MMM-SleepIQControl
 *
 * By Buzz Kc
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var API = require('./API.js');
var config;
var api;

module.exports = NodeHelper.create({



	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "MMM-SleepIQControl_SEND_CONFIG") {
			this.config = payload;
			this.api = new API(this.config.username, this.config.password);

			this.api.login()
				.then((success) => {
					this.sendSocketNotification("MMM-SleepIQControl_LOGIN_SUCCESS", success);
				})
				.catch((err) => {
					this.sendSocketNotification("MMM-SleepIQControl_Console", err);
				});
		}
		if (notification === "MMM-SleepIQControl_GET_DATA") {
			this.getData();
		}

		if (notification === "MMM-SleepIQControl_USER_ACTION") {
			this.setUserAction(payload);
		}
	},

	getData: function () {
		this.sendSocketNotification("MMM-SleepIQControl_Console", "getting data");
		//get familystatus, parse and update ui
		this.api.familyStatus()
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", success);
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
	},

	setUserAction: function(action) {
		this.sendSocketNotification("MMM-SleepIQControl_Console", "getting data");
		//get familystatus, parse and update ui
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("MMM-SleepIQControl-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-SleepIQControl/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}
});
