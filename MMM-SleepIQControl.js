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
	foundationError: true,
	sleeperData: null,
	currentAction: null,

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

	updateConfig: function() {
		this.sendSocketNotification('MMM-SleepIQControl_UPDATE_CONFIG', this.config);
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
		var c, r, t, b;
		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		if (this.foundationError === true) {
			wrapper.innerHTML = "<span class='sleepIQFoundationError'>Unable to communicate with foundation.</span>";
		}
		// If this.dataRequest is not empty
		else if (this.sleeperData) {
			//var wrapperDataRequest = document.createElement("div");
			t = document.createElement('table');
			r = t.insertRow(0);
			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addSleeperButton(this.sleeperData[0], this.bedData.rightSide, 'right'));
			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.innerHTML = "<span class='sleepIQTitle>" + this.accountData.name + "</span>";
			/* wip
			var input = document.createElement("input");
			input.type='number';
			input.setAttribute('min', 0);
			input.setAttribute('max', 100);
			input.setAttribute('step', 5);
			input.setAttribute('id', 'stepNumber');
			c.appendChild(input);
			*/
			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addSleeperButton(this.sleeperData[1], this.bedData.leftSide, 'left'));

			//get foundations current position for current user
			var side = this.config.primarySleeper;
			var currentPosition = this.foundationData.fsCurrentPositionPresetLeft;
			if (side === 'right') currentPosition = this.foundationData.fsCurrentPositionPresetRight;
			console.log("currentPosition: " + currentPosition);

			//row 1
			r = t.insertRow(1);
			/* wip
			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addActionButton("Head"));
			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addActionButton("Feet"));
			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addActionButton("Firmness"));
			c = r.insertCell(3);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addDirectionButton("Up"));
			c = r.insertCell(4);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addDirectionButton("Down"));
			*/

			/**
				FAVORITE = 1
				READ = 2
				WATCH_TV = 3
				FLAT = 4dt
				ZERO_G = 5
				SNORE = 6
			*/
			//row 2
			r = t.insertRow(2);

			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Favorite", 1, currentPosition));

			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Read", 2, currentPosition));

			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Watch TV", 3, currentPosition));

			//row 3
			r = t.insertRow(3);

			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Flat", 4, currentPosition));

			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Zero G", 5, currentPosition));

			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Snore", 6, currentPosition));

			//wrapper.appendChild(wrapperDataRequest);
			wrapper.appendChild(t);


		}

		return wrapper;
	},

	addActionButton: function(buttonType) {
		var b = document.createElement("button");
		b.innerHTML = buttonType;
		b.addEventListener("click", () => this.runAction(buttonType));
		b.setAttribute("id", buttonType + "ActionButton");
		var currentActionCSS = '';
		if (buttonType === this.currentAction) currentActionCSS = 'currentAction '
		b.setAttribute("class", currentActionCSS + "actionButton");
		return b;
	},

	addDirectionButton: function(buttonType) {
		var b = document.createElement("button");
		b.innerHTML = buttonType;
		b.addEventListener("click", () => this.updateStepNumber(buttonType));
		b.setAttribute("id", buttonType + "DirectionButton");
		b.setAttribute("class", "actionButton");
		return b;
	},

	addSleeperButton: function(sleeper, bedside, side) {
		var b = document.createElement("button");
		b.innerHTML = "<span class='sleeperName'>" +sleeper.firstName + "</span><br><span class='sleepNumber'>" + bedside.sleepNumber + "</span>";
		b.addEventListener("click", () => this.setPrimarySleeper(side));
		b.setAttribute("id", side + "SleeperButton");
		var currentSleeper = '';
		if (side === this.config.primarySleeper) currentSleeper = 'currentSleeper '
		b.setAttribute("class", currentSleeper + "platformButton");
		return b;
	},

	addButton: function(innerHtml, value, currentPosition) {
		var b = document.createElement("button");
		b.innerHTML = "<img class='platformButtonImg' src='./modules/MMM-SleepIQControl/images/" +innerHtml.toLowerCase().trim().replace(/\s+/g, '') + ".png'><br>" +innerHtml;
		b.addEventListener("click", () => this.adjustPlatform(value));
		b.setAttribute("id", innerHtml.toLowerCase().trim().replace(/\s+/g, '') + "Button");
		var currentPositionCSS = '';
		if (currentPosition === innerHtml) currentPositionCSS = 'currentFoundationSetting '
		b.setAttribute("class", currentPositionCSS + "platformButton");
		return b;
	},

	adjustPlatform: function(level) {
		console.log("Adjust platform to " + level);
		this.sendSocketNotification("MMM-SleepIQControl_USER_ACTION", level)
	},

	setPrimarySleeper: function(side) {
		this.config.primarySleeper = side;
		this.updateConfig();
		this.updateDom();
	},

	runAction: function(action) {
		console.log(action);
	},

	updateStepNumber: function(action) {
		console.log(action);
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
			this.foundationError = false;
			console.log("Foundation Data: ");
			console.log(this.foundationData);
		}

		if (notification === "MMM-SleepIQControl_FOUNDATION_SYS_DATA_RETURNED") {
			this.foundationSystemData = payload;
			this.foundationError = true;
			console.log("Foundation System Data: ");
			console.log(this.foundationSystemData);
		}

		if (notification === "MMM-SleepIQControl_FOUNDATION_DATA_ERROR") {
			this.foundationSystemData = payload;
			this.updateDom();
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
