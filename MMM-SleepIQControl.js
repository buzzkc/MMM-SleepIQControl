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
	footwarmerData: null,
	sleeperData: null,
	currentAction: 'Firmness',
	currentActionValue: null,
	currentFootwarmerTemp: 0,
	currentFootwarmerTimer: 0,

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

			if (this.currentActionValue === null) {
				this.currentActionValue = this.bedData[this.config.primarySleeper +'Side'].sleepNumber;
			}
			//var wrapperDataRequest = document.createElement("div");
			t = document.createElement('table');
			r = t.insertRow(0);
			c = r.insertCell(0);

			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addSleeperButton(this.sleeperData[0], this.bedData.rightSide, 'right'));

			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			//c.innerHTML = "<span class='sleepIQTitle>" + this.accountData.name + "</span>";

			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addSleeperButton(this.sleeperData[1], this.bedData.leftSide, 'left'));

			if (this.currentAction === 'Warmer') {
				if (this.currentFootwarmerTemp === null )	this.currentFootwarmerTemp = this.footwarmerData['footWarmingStatus' + this.toTitleCase(this.config.primarySleeper)];
				c = r.insertCell(3);
				c.setAttribute("class", "sleepIQControlCell");
				c.colSpan = 2;
				var tempGroup = document.createElement("div");
				tempGroup.setAttribute('id', 'radio-toolbar');
				tempGroup.setAttribute('class', 'radio-toolbar');
				tempGroup.appendChild(this.addRadio('Off', 0));
				tempGroup.appendChild(this.addTempLabel('Off', 0));
				tempGroup.appendChild(this.addRadio('Low', 31));
				tempGroup.appendChild(this.addTempLabel('Low', 31));
				tempGroup.appendChild(this.addRadio('Med', 57));
				tempGroup.appendChild(this.addTempLabel('Med', 57));
				tempGroup.appendChild(this.addRadio('Hi', 72));
				tempGroup.appendChild(this.addTempLabel('Hi', 72));
				c.appendChild(tempGroup);

				//<div class="radio-toolbar">
			} else {
				c = r.insertCell(3);
				c.setAttribute("class", "sleepIQControlCell");
				var input = document.createElement("input");
				input.type='number';
				input.setAttribute('min', 0);
				input.setAttribute('max', 100);
				input.setAttribute('step', 5);
				input.setAttribute('id', 'stepNumber');
				input.setAttribute('class', 'stepNumber');
				input.value = this.currentActionValue;
				c.appendChild(input);
				//c.appendChild(document.createElement("BR"));
				c.appendChild(this.addActionButton("Set"));
				c.colSpan = 2;
			}


			//c = r.insertCell(4);
			//c.setAttribute("class", "sleepIQControlCell");

			//get foundations current position for current user
			var side = this.config.primarySleeper;
			var currentPosition = this.foundationData.fsCurrentPositionPresetLeft;
			if (side === 'right') currentPosition = this.foundationData.fsCurrentPositionPresetRight;
			console.log("currentPosition: " + currentPosition);

			//row 2
			/**
				FAVORITE = 1
				READ = 2
				WATCH_TV = 3
				FLAT = 4dt
				ZERO_G = 5
				SNORE = 6
			*/
			//row 2
			r = t.insertRow(1);

			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Favorite", 1, currentPosition));

			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Read", 2, currentPosition));

			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Watch TV", 3, currentPosition));

			if (this.currentAction === 'Warmer') {
				if (this.currentFootwarmerTimer === null ) this.currentFootwarmerTimer = this.footwarmerData['footWarmingTimer' + this.toTitleCase(this.config.primarySleeper)];
				c = r.insertCell(3);
				c.setAttribute("class", "sleepIQControlCell");
				c.colSpan = 2;
				var tempGroup = document.createElement("div");
				tempGroup.setAttribute('id', 'radio-toolbar-temp');
				tempGroup.setAttribute('class', 'radio-toolbar-temp');
				tempGroup.appendChild(this.addRadioTimer('Off', 0));
				tempGroup.appendChild(this.addTimerLabel('Off', 0));
				//tempGroup.appendChild(this.addRadioTimer('1h', 60));
			//	tempGroup.appendChild(this.addLabel('1h'));
				tempGroup.appendChild(this.addRadioTimer('2h', 120));
				tempGroup.appendChild(this.addTimerLabel('2h', 120));
				//tempGroup.appendChild(this.addRadioTimer('4h', 240));
				//tempGroup.appendChild(this.addLabel('4h'));
				tempGroup.appendChild(this.addRadioTimer('6h', 360));
				tempGroup.appendChild(this.addTimerLabel('6h', 360));

				c.appendChild(tempGroup);
				c.appendChild(this.addActionButton("Go"));


			} else {
				c = r.insertCell(3);
				c.setAttribute("class", "sleepIQControlCell");
				c.appendChild(this.addDirectionButton("Up"));

				c = r.insertCell(4);
				c.setAttribute("class", "sleepIQControlCell");
				c.appendChild(this.addDirectionButton("Down"));

			}

			//row 3
			r = t.insertRow(2);

			c = r.insertCell(0);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Flat", 4, currentPosition));

			c = r.insertCell(1);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Zero G", 5, currentPosition));

			c = r.insertCell(2);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addButton("Snore", 6, currentPosition));

			c = r.insertCell(3);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addActionButton("Head"));
			c.appendChild(this.addActionButton("Firmness"));

			c = r.insertCell(4);
			c.setAttribute("class", "sleepIQControlCell");
			c.appendChild(this.addActionButton("Foot"));
			c.appendChild(this.addActionButton("Warmer"));

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
		b.addEventListener("click", () => this.updateStepNumber(buttonType, 1));
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

	addRadio: function(label, value) {
		var i = document.createElement("input");
		i.setAttribute('id', 'radioFootwarmer' + this.toTitleCase(label));
		i.setAttribute('name', 'radioFootwarmer');
		i.setAttribute('type', 'radio');
		i.setAttribute('value', value);
		i.addEventListener("click", () => this.setFootwarmerTemp(value));

		if (this.currentFootwarmerTemp === value) {
			i.setAttribute('checked', 'checked');
		}
		return i;
	},

	setFootwarmerTemp: function(value) {
		this.currentFootwarmerTemp = value;
		this.updateDom();
	},

	addRadioTimer: function(label, value) {
		var i = document.createElement("input");
		i.setAttribute('id', 'radioFootwarmer' + this.toTitleCase(label));
		i.setAttribute('name', 'radioFootwarmerTemp');
		i.setAttribute('type', 'radio');
		i.setAttribute('value', value);
		i.addEventListener("click", () => this.setFootwarmerTimer(value));
		if (this.currentFootwarmerTimer === value
			|| (value == 60 && this.currentFootwarmerTimer > 0 && this.currentFootwarmerTimer < 60)
			|| (value == 120 && this.currentFootwarmerTimer > 60 && this.currentFootwarmerTimer < 120)
			|| (value == 240 && this.currentFootwarmerTimer > 120 && this.currentFootwarmerTimer < 240)
			|| (value == 360 && this.currentFootwarmerTimer > 240 && this.currentFootwarmerTimer < 360)
			) {
			i.setAttribute('checked', 'checked');
		}
		return i;
	},

	setFootwarmerTimer: function(value) {
		this.currentFootwarmerTimer = value;
		this.updateDom();
	},

	addTempLabel: function(label, value) {
		var l = document.createElement('label');
		l.setAttribute('for', label);
		l.innerHTML = this.toTitleCase(label);
		l.addEventListener("click", () => this.setFootwarmerTemp(value));
		return l;
	},

	addTimerLabel: function(label, value) {
		var l = document.createElement('label');
		l.setAttribute('for', label);
		l.innerHTML = this.toTitleCase(label);
		l.addEventListener("click", () => this.setFootwarmerTimer(value));
		return l;
	},

	addOption: function(text, value) {
		var option = document.createElement("option");
		option.text = text;
		option.value = value;
		return option;
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
		if (action === 'Head') {
			this.currentAction = 'Head';
			this.currentActionValue = parseInt(this.foundationData['fs' + this.toTitleCase(this.config.primarySleeper) + 'HeadPosition'],16);

		} else if (action === 'Foot') {
			this.currentAction = 'Foot';
			this.currentActionValue = parseInt(this.foundationData['fs' + this.toTitleCase(this.config.primarySleeper) + 'FootPosition'],16);

		} else if (action === 'Firmness') {
			this.currentAction = 'Firmness';
			this.currentActionValue = this.bedData[this.config.primarySleeper +'Side'].sleepNumber;

		} else if (action === 'Warmer') {
			this.currentAction = 'Warmer';
			console.log(this.footwarmerData['footWarmingStatus' + this.toTitleCase(this.config.primarySleeper)])
			console.log(this.footwarmerData['footWarmingTimer' + this.toTitleCase(this.config.primarySleeper)])
			this.currentActionValue = this.footwarmerData['footWarmingStatus' + this.toTitleCase(this.config.primarySleeper)];

		} else if (action === 'Set') {
			//call function that calls correct socket notification based on currentAction and value of stepNumber.
		} else if (action === 'Go') {
			//send socket notification to turn on footwarmer.
			var settings = {side: this.config.primarySleeper, temp: this.currentFootwarmerTemp, duration: this.currentFootwarmerTimer};
			console.log(settings);
			this.sendSocketNotification('MMM-SleepIQControl_FOOTWARMER_ACTION', settings);
		}

		console.log(this.currentAction);
		this.updateDom();
	},

	updateStepNumber: function(action, value) {
		if (action === "Up") {
			document.getElementById("stepNumber").stepUp(value);
		} else {
			document.getElementById("stepNumber").stepDown(value);
		}

		console.log(action);
	},

	toTitleCase: function(str) {
		str = str.toLowerCase().split(' ');
		for (var i = 0; i < str.length; i++) {
			str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
		}
		return str.join(' ');
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

		if (notification === "MMM-SleepIQControl_FOOTWARMER_DATA_RETURNED") {
			this.footwarmerData = payload;
			console.log("Footwarmer Data: ");
			console.log(this.footwarmerData);
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

		if (notification === "MMM-SleepIQControl_FOOTWARMER_ACTION_RETURNED") {
			console.log("footwarmer results");
			console.log(payload);
		}

		if (notification === "MMM-SleepIQControl_Console") {
			console.log("Output: ");
			console.log(payload);
			//this.bed = payload.beds[0];
		}

	},
});
