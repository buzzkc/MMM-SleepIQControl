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

		if (notification === "MMM-SleepIQControl_HEAD_ACTION") {
			this.setHeadAction(payload);
		}

		if (notification === "MMM-SleepIQControl_FOOT_ACTION") {
			this.setFootAction(payload);
		}

		if (notification === "MMM-SleepIQControl_FOOTWARMER_ACTION") {
			var settings = [];
			settings = payload;

			this.setFootwarmer(settings);
		}

		if (notification === "MMM-SleepIQControl_SLEEPNUMBER_ACTION") {
			this.setSleepNumber(payload);
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
				this.getFootwarmerStatus();
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", JSON.parse(err));
				this.sendSocketNotification("MMM-SleepIQControl_FOUNDATION_DATA_ERROR", JSON.parse(err));
			});
	},

	getFootwarmerStatus: function () {
		this.api.footwarmerStatus()
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_FOOTWARMER_DATA_RETURNED", JSON.parse(success));
				this.getSleeper();
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", JSON.parse(err));
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

	setHeadAction: function(num) {
		var side = 'R';
		if (this.config.primarySleeper === 'left') side = 'L';

		this.api.adjust (side, 'H', num)
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_HEAD_ACTION_RETURNED", JSON.parse(success));
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
	},

	setFootAction: function(num) {
		var side = 'R';
		if (this.config.primarySleeper === 'left') side = 'L';

		this.api.adjust (side, 'F', num)
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_FOOT_ACTION_RETURNED", JSON.parse(success));
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
	},

	setFootwarmer: function(settings) {
		var side = this.config.primarySleeper;
		var temp = settings.temp;
		var duration = settings.duration;

		this.api.footwarmer(side, temp, duration)
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_FOOTWARMER_ACTION_RETURNED", JSON.parse(success));
			})
			.catch((err) => {
				this.sendSocketNotification("MMM-SleepIQControl_Console", err);
			});
	},

	setSleepNumber: function (num) {
		var side = 'L';
		if (this.config.primarySleeper === 'right') side = 'R';

		this.api.sleepNumber(side, num)
			.then((success) => {
				this.sendSocketNotification("MMM-SleepIQControl_SLEEPNUMBER_ACTION_RETURNED", JSON.parse(success));
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
