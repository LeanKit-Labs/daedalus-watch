var logger = require( "../logger.js" )();
var log = logger( "daedalus-watch:adapters:rabbitmq" );
var _ = require( "lodash" );
var postal = require( "postal" );
var rabbit = require( "wascally" );
var channel = postal.channel( "watcher" );

var changeSub;

function onChange( data ) {
	var watcher = data.watcher;
	var change = data.data;

	var exchange = watcher.adapters.rabbitmq.exchange;
	var routingKey = watcher.type + "." + watcher.name + "." + "change";

	log.info( "Publishing change message to exchange %s with routing key %s", exchange, routingKey );
	log.debug( JSON.stringify( change, null, 2 ) );

	rabbit.publish( exchange, {
		routingKey: routingKey,
		body: change
	} );

}

function onError() {

}

function start() {
	changeSub = channel.subscribe( {
		topic: "change",
		callback: onChange
	} ).constraint( function( env ) {
		var adapter = _.get( env, "watcher.adapters.rabbitmq" );
		return !_.isEmpty( adapter );
	} );
}

function stop() {
	changeSub.unsubscribe();
}

module.exports = function( config ) {
	log.info( "Initializing RabbitMQ adapter." );
	var cfg = config.rabbitmq;

	if ( !cfg ) {
		log.info( "No RabbitMQ configuration found." );
		return;
	}

	log.debug( "RabbitMQ configuration:" );
	log.debug( JSON.stringify( cfg, null, 2 ) );

	rabbit.configure( cfg );

	start();

	return {
		stop: stop
	};

};
