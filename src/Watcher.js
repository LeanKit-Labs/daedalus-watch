var logger = require( './logger.js' )();
var log = logger( 'daedalus-watch:watcher' );
var _ = require( 'lodash' );
var channel = require( 'postal' ).channel( 'watcher' );

function Watcher( consul, config ) {
	this.name = config.name;
	this.type = config.type;
	this.options = consul.ACL_TOKEN ? _.merge( { token: consul.ACL_TOKEN }, config.options ) : config.options;
	this.adapters = config.adapters;
	this.lastUpdate = null;

	log.debug( 'Watcher Created: %s: %s with options: ', this.type, this.name );
	log.debug( JSON.stringify( this.options, null, 2 ) );

	var consulMethod = _.get( consul, config.type );

	if ( config.start !== false ) {
		this.watch = consul.watch( {
			method: consulMethod,
			options: this.options
		} );

		this.watch.on( 'change', this.onChange.bind( this ) );
		this.watch.on( 'error', this.onError.bind( this ) );
		this.watch.on( 'cancel', this.onCancel.bind( this ) );
	}
}

Watcher.prototype.toObject = function() {
	return _.pick( this, [ 'name', 'type', 'options', 'adapters', 'lastUpdate' ] );
};

Watcher.prototype.onChange = function( data ) {
	log.info( 'Change event detected in %s: %s', this.type, this.name );
	if ( !_.isEqual( this.lastUpdate, data ) ) {
		// Do something cool
		var payload = {
			watcher: this.toObject(),
			data: data
		};

		channel.publish( {
			topic: 'change',
			data: payload
		} );

		this.lastUpdate = data;
	} else {
		log.debug( 'False alarm in %s: %s', this.type, this.name );
	}
};

Watcher.prototype.onError = function( err ) {
	log.error( 'Error detected in %s: %s', this.type, this.name );
	log.error( err.toString() );
};

Watcher.prototype.onCancel = function() {
	log.error( 'Watch canceled for %s: %s', this.type, this.name );
};

module.exports = Watcher;
