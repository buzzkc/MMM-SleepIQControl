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
					this.sendSocketNotification("MMM-SleepIQControl_LOGIN_SUCCESS", JSON.parse(success));
				})
				.catch((err) => {
					this.sendSocketNotification("MMM-SleepIQControl_Console", err);
				});
		}
		if (notification === "MMM-SleepIQControl_UPDATE_CONFIG") {
			this.config = payload;
		}
		if (notification === "MMM-SleepIQControl_GET_DATA") {
			this.getAccountData();
		}

		if (notification === "MMM-SleepIQControl_USER_ACTION") {
			this.setUserAction(payload);
		}
	},

	getAccountData: function () {
		this.sendSocketNotification("MMM-SleepIQControl_Console", "getting data");
		//get familystatus, parse and update ui
		this.api.bed()
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_ACCT_DATA_RETURNED", JSON.parse(success));
				this.getFamilyStatus();
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
	},

	getFamilyStatus: function () {
		this.sendSocketNotification("MMM-SleepIQControl_Console", "getting data");
		//get familystatus, parse and update ui
		this.api.familyStatus()
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_BED_DATA_RETURNED", JSON.parse(success));
				this.getFoundationStatus();
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
	},

	getFoundationSystem: function () {
		this.api.foundationSystem()
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_FOUNDATION_SYS_DATA_RETURNED", JSON.parse(success));
				this.getFoundationStatus();
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
	},

	getFoundationStatus: function () {
		this.api.foundationStatus()
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_FOUNDATION_DATA_RETURNED", JSON.parse(success));
				this.getSleeper();
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", JSON.parse(err));
				this.sendSocketNotification("MMM-SleepIQControl_FOUNDATION_DATA_ERROR", JSON.parse(err));
			});
	},

	getSleeper: function () {
		this.api.sleeper()
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_SLEEPER_DATA_RETURNED", JSON.parse(success));
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});

	},

	setUserAction: function(action) {
		var side = 'R';
		if (this.config.primarySleeper === 'left') side = 'L';

		this.api.preset(side, action)
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_FOUNDATION_ACTION_RETURNED", JSON.parse(success));
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
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
