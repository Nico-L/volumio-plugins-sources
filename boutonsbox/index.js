'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var Gpio = require('onoff').Gpio;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var actions = ["shutdown"];

module.exports = boutonsbox;

function boutonsbox(context) {
	self.logger.info('boutonsbox context:', context);
	var self = this;
	self.context=context;
	self.commandRouter = self.context.coreCommand;
	self.logger = self.context.logger;
	self.triggers = [];
}

boutonsbox.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

	self.logger.info("boutonsBox initialized")

    return libQ.resolve();
}

boutonsbox.prototype.onStart = function() {
    var self = this;
	var defer=libQ.defer();


	self.createTriggers()
		.then (function (result) {
			self.logger.info("boutonsBox started");
			defer.resolve();
		});

    return defer.promise;
};

boutonsbox.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

    self.clearTriggers()
		.then (function (result) {
			self.logger.info("boutonsBox stopped");
			defer.resolve();
		});

    return libQ.resolve();
};

boutonsbox.prototype.onRestart = function() {
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

boutonsbox.prototype.getUIConfig = function() {
	var defer = libQ.defer();
	var self = this;

	self.logger.info('boutonsBox: Getting UI config');

	//Just for now..
	var lang_code = 'en';

	self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
			__dirname+'/i18n/strings_en.json',
			__dirname + '/UIConfig.json')
	.then(function(uiconf)
	{
		/*var i = 0;
		actions.forEach(function(action, index, array) {
			
			// Strings for config
			var c1 = action.concat('.enabled');
			var c2 = action.concat('.pin');
			
			// accessor supposes actions and uiconfig items are in SAME order
			// this is potentially dangerous: rewrite with a JSON search of "id" value ?				
			uiconf.sections[0].content[2*i].value = self.config.get(c1);
			uiconf.sections[0].content[2*i+1].value.value = self.config.get(c2);
			uiconf.sections[0].content[2*i+1].value.label = self.config.get(c2).toString();

			i = i + 1;
		}); */
		self.logger.info('boutonsBox: Getting UI config done');
		defer.resolve(uiconf);
	})
	.fail(function()
	{
		defer.reject(new Error());
	});

	return defer.promise;
};

boutonsbox.prototype.getConfigurationFiles = function() {
	return ['config.json'];
}

boutonsbox.prototype.setUIConfig = function(data) {
	var self = this;
	//Perform your installation tasks here
};

boutonsbox.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

boutonsbox.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};

boutonsbox.prototype.saveConfig = function(data)
{
	var self = this;
	self.logger.info('saveConfig:', actions);
	
	actions.forEach(function(action, index, array) {
 		// Strings for data fields
		var s1 = action.concat('Enabled');
		var s2 = action.concat('Pin');

		// Strings for config
		var c1 = action.concat('.enabled');
		var c2 = action.concat('.pin');
		var c3 = action.concat('.value');

		self.config.set(c1, data[s1]);
		self.config.set(c2, data[s2]['value']);
		self.config.set(c3, 0);
	});
	self.logger.info('saveConfig done');
	self.clearTriggers()
		.then(self.createTriggers());

	self.commandRouter.pushToastMessage('success',"boutonsBox", "Configuration saved");
};

//creating triggers 
boutonsbox.prototype.createTriggers = function() {
	var self = this;

	self.logger.info('boutonsbox: Reading config and creating triggers...');
	self.logger.info('createTriggers:', self.triggers);
	actions.forEach(function(action, index, array) {
		var c1 = action.concat('.enabled');
		var c2 = action.concat('.pin');

		var enabled = self.config.get(c1);
		var pin = self.config.get(c2);

		if(enabled === true){
			self.logger.info('boutonsbox: '+ action + ' on pin ' + pin);
			var j = new Gpio(pin,'in','both');
			j.watch(self.listener.bind(self,action));
			self.triggers.push(j);
		}
	});
		
	return libQ.resolve();
};

boutonsbox.prototype.clearTriggers = function () {
	var self = this;
	self.logger.info('clearTriggers:', self.triggers);
	self.triggers.forEach(function(trigger, index, array) {
  		self.logger.info("GPIO-Buttons: Destroying trigger " + index);

		trigger.unwatchAll();
		trigger.unexport();		
	});
	
	self.triggers = [];

	return libQ.resolve();	
};


boutonsbox.prototype.listener = function(action,err,value){
	var self = this;

	var c3 = action.concat('.value');
	var lastvalue = self.config.get(c3);

	// IF change AND high (or low?)
	if(value !== lastvalue && value === 1){
		//do thing
		self[action]();
	}
	// remember value
	self.config.set(c3,value);
};

//shutdown
boutonsbox.prototype.shutdown = function() {
	// this.logger.info('GPIO-Buttons: shutdown button pressed\n');
	this.commandRouter.shutdown();
  };