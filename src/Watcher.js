var logger = require( "./logger.js" )();
var log = logger( "daedalus-watch:watcher" );
var _ = require( "lodash" );
var channel = require( "postal" ).channel( "watcher" );

/*
	What happens when a watch closes because of 10m timeout?
*/

function Watcher( consul, config ) {
	this.name = config.name;
	this.type = config.type;
	this.options = config.options;
	this.adapters = config.adapters;
	this.lastUpdate = null;

	var consulMethod = _.get( consul, config.type );

	if ( config.start !== false ) {
		this.watch = consul.watch( {
			method: consulMethod,
			options: this.options
		} );

		this.watch.on( "change", this.onChange.bind( this ) );
		this.watch.on( "error", this.onError.bind( this ) );
	}
}

Watcher.prototype.toObject = function() {
	return _.pick( this, [ "name", "type", "options", "adapters", "lastUpdate" ] );
};

Watcher.prototype.onChange = function( data ) {
	log.debug( "Change event detected in %s: %s", this.type, this.name );
	if ( !_.isEqual( this.lastUpdate, data ) ) {
		// Do something cool
		var payload = {
			watcher: this.toObject(),
			data: data
		};

		channel.publish( {
			topic: "change",
			data: payload
		} );

		this.lastUpdate = data;
	} else {
		log.debug( "False alarm in %s: %s", this.type, this.name );
	}
};

Watcher.prototype.onError = function( err ) {
	log.error( "Error detected in %s: %s", this.type, this.name );
	log.error( err.toString() );
};

module.exports = Watcher;
