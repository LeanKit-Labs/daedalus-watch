var defaultConfig = {
	adapters: {
		stdOut: {
			level: 5,
			bailIfDebug: true, // disables stdOut if DEBUG=* is in play
			timestamp: {
				local: true, // defaults to UTC
				format: "MMM-D-YYYY hh:mm:ss A" // ex: Jan 1, 2015 10:15:20 AM
			}
		},
		"debug": {
			level: 5
		}
	}
};
var postal = require( "postal" );
var wp = require( "whistlepunk" );
var logger;

module.exports = function( _config ) {
	if ( logger ) {
		return logger;
	}

	var config = _config;
	if ( !config ) {
		config = defaultConfig;
	}

	logger = wp( postal, config );

	return logger;
};
