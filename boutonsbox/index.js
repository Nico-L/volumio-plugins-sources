'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var Gpio = require('onoff').Gpio;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var actions = ["shutdown"];

module.exports = boutonsbox;

function boutonsbox(context) {
	var self = this;
	self.context=context;
	self.commandRouter = self.context.coreCommand;
	self.logger = self.context.logger;
	self.triggers = [];
}


module.exports = boutonsbox;
function boutonsbox(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

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
		self.logger.info('boutonsBox: uiconf', uiconf);
		var i = 0;
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
		});

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

	self.clearTriggers()
		.then(self.createTriggers());

	self.commandRouter.pushToastMessage('success',"boutonsBox", "Configuration saved");
};


// Playback Controls ---------------------------------------------------------------------------------------
// If your plugin is not a music_sevice don't use this part and delete it


boutonsbox.prototype.addToBrowseSources = function () {

	// Use this function to add your music service plugin to music sources
    //var data = {name: 'Spotify', uri: 'spotify',plugin_type:'music_service',plugin_name:'spop'};
    this.commandRouter.volumioAddToBrowseSources(data);
};

boutonsbox.prototype.handleBrowseUri = function (curUri) {
    var self = this;

    //self.commandRouter.logger.info(curUri);
    var response;


    return response;
};



// Define a method to clear, add, and play an array of tracks
boutonsbox.prototype.clearAddPlayTrack = function(track) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'boutonsbox::clearAddPlayTrack');

	self.commandRouter.logger.info(JSON.stringify(track));

	return self.sendSpopCommand('uplay', [track.uri]);
};

boutonsbox.prototype.seek = function (timepos) {
    this.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'boutonsbox::seek to ' + timepos);

    return this.sendSpopCommand('seek '+timepos, []);
};

// Stop
boutonsbox.prototype.stop = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'boutonsbox::stop');


};

// Spop pause
boutonsbox.prototype.pause = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'boutonsbox::pause');


};

// Get state
boutonsbox.prototype.getState = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'boutonsbox::getState');


};

//Parse state
boutonsbox.prototype.parseState = function(sState) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'boutonsbox::parseState');

	//Use this method to parse the state and eventually send it with the following function
};

// Announce updated State
boutonsbox.prototype.pushState = function(state) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'boutonsbox::pushState');

	return self.commandRouter.servicePushState(state, self.servicename);
};


boutonsbox.prototype.explodeUri = function(uri) {
	var self = this;
	var defer=libQ.defer();

	// Mandatory: retrieve all info for a given URI

	return defer.promise;
};

boutonsbox.prototype.getAlbumArt = function (data, path) {

	var artist, album;

	if (data != undefined && data.path != undefined) {
		path = data.path;
	}

	var web;

	if (data != undefined && data.artist != undefined) {
		artist = data.artist;
		if (data.album != undefined)
			album = data.album;
		else album = data.artist;

		web = '?web=' + nodetools.urlEncode(artist) + '/' + nodetools.urlEncode(album) + '/large'
	}

	var url = '/albumart';

	if (web != undefined)
		url = url + web;

	if (web != undefined && path != undefined)
		url = url + '&';
	else if (path != undefined)
		url = url + '?';

	if (path != undefined)
		url = url + 'path=' + nodetools.urlEncode(path);

	return url;
};





boutonsbox.prototype.search = function (query) {
	var self=this;
	var defer=libQ.defer();

	// Mandatory, search. You can divide the search in sections using following functions

	return defer.promise;
};

boutonsbox.prototype._searchArtists = function (results) {

};

boutonsbox.prototype._searchAlbums = function (results) {

};

boutonsbox.prototype._searchPlaylists = function (results) {


};

boutonsbox.prototype._searchTracks = function (results) {

};

boutonsbox.prototype.goto=function(data){
    var self=this
    var defer=libQ.defer()

// Handle go to artist and go to album function

     return defer.promise;
};
