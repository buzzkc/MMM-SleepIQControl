/* global Module */

/* Magic Mirror
 * Module: MMM-SleepIQControl
 *
 * By Buzz Kc
 * MIT Licensed.
 */

Module.register("MMM-SleepIQControl", {
	defaults: {
		title: 'SleepIQ Control',
		updateInterval: 300000,
		username: '',
		password: '',
		primarySleeper: 'left' // left or right
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror
	accountData: null,
	bedData: null,
	foundationSystemData: null,
	foundationData: null,
	sleeperData: null,

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;
		var bed = null;

		//Flag for check if module is loaded
		this.loaded = false;
		this.sendConfig();

		// Schedule update timer.
		//this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	sendConfig: function() {
		this.sendSocketNotification('MMM-SleepIQControl_SEND_CONFIG', this.config);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		this.sendSocketNotification('MMM-SleepIQControl_GET_DATA', null);
	},



	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
			self.scheduleUpdate();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		/** To-do
		 * Add UI components
		 * Update components using global data
		 * Add Actions to Components
		 * Refresh ui data upon action completion
		 */

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		// If this.dataRequest is not empty
		if (this.sleeperData) {
			var wrapperDataRequest = document.createElement("div");
			wrapperDataRequest.innerHTML = this.accountData.name;
			var side = this.config.primarySleeper;
			var c, r, t, b;
			t = document.createElement('table');

			//row 1
			r = t.insertRow(0);
			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			if (this.config.primarySleeper === 'right') {
					c.innerHTML = "<span class='sleeperdetails'>Sleeper: " + this.sleeperData[0].firstName + "</span>";
			} else {
					c.innerHTML = "<span class='sleeperdetails'>Sleeper: " + this.sleeperData[1].firstName + "</span>";
			}
			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			if (this.config.primarySleeper === 'right') {
					c.innerHTML = "<span class='sleeperdetails'>Sleep Number: " + this.bedData.rightSide.sleepNumber + "</span>";

			} else {
			    c.innerHTML = "<span class='sleeperdetails'>Sleep Number: " + this.bedData.leftSide.sleepNumber + "</span>";
		  }
			/**
				FAVORITE = 1
				READ = 2
				WATCH_TV = 3
				FLAT = 4
				ZERO_G = 5
				SNORE = 6
			*/
			//row 2
			r = t.insertRow(1);

			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Favorite", 1));

			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Read", 2));

			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Watch Tv", 3));

			//row 3
			r = t.insertRow(2);

			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Flat", 4));

			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Zero G", 5));

			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Snore", 6));

			wrapper.appendChild(wrapperDataRequest);
			wrapper.appendChild(t);
		}

		return wrapper;
	},

	addButton: function(innerHtml, value) {
		var b = document.createElement("button");
		b.innerHTML = "<img class='platformButtonImg' src='./modules/MMM-SleepIQControl/images/" +innerHtml.toLowerCase().trim().replace(/\s+/g, '') + ".png'><br>" +innerHtml;
		b.addEventListener("click", () => this.adjustPlatform(value));
		b.setAttribute("id", innerHtml.trim());
		b.setAttribute("class","platformButton");
		return b;
	},

	adjustPlatform: function(level) {
		console.log("Adjust platform to " + level);
		this.sendSocketNotification("MMM-SleepIQControl_USER_ACTION", level)
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-SleepIQControl.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("MMM-SleepIQControl-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-SleepIQControl-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}

		if (notification === "MMM-SleepIQControl_LOGIN_SUCCESS") {
			console.log("Output: ");
			console.log(payload);
			this.scheduleUpdate(2000);
		}

		if (notification === "MMM-SleepIQControl_ACCT_DATA_RETURNED") {
			this.accountData = payload.beds[0];
			console.log("Account Data: ");
			console.log(this.accountData);
		}

		if (notification === "MMM-SleepIQControl_BED_DATA_RETURNED") {
			this.bedData = payload.beds[0];
			console.log("Bed Data: ");
			console.log(this.bedData);
		}

		if (notification === "MMM-SleepIQControl_FOUNDATION_DATA_RETURNED") {
			this.foundationData = payload;
			console.log("Foundation Data: ");
			console.log(this.foundationData);
		}

		if (notification === "MMM-SleepIQControl_FOUNDATION_SYS_DATA_RETURNED") {
			this.foundationSystemData = payload;
			console.log("Foundation System Data: ");
			console.log(this.foundationSystemData);
		}

		if (notification === "MMM-SleepIQControl_SLEEPER_DATA_RETURNED") {
			this.sleeperData = payload.sleepers;
			console.log("Sleeper Data: ");
			console.log(this.sleeperData);
			this.updateDom();
		}

		if (notification === "MMM-SleepIQControl_FOUNDATION_ACTION_RETURNED") {
			console.log("Foundation Action Status: ");
			console.log(payload);
			this.sendSocketNotification('MMM-SleepIQControl_GET_DATA', null);
		}

		if (notification === "MMM-SleepIQControl_Console") {
			console.log("Output: ");
			console.log(payload);
			//this.bed = payload.beds[0];
		}
	},
});
