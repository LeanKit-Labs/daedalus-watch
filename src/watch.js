var logger = require( "./logger.js" )();
var log = logger( "daedalus-watch:init" );
var fs = require( "fs" );
var path = require( "path" );
var _ = require( "lodash" );
var filePrefix = "file://";
var cwd = process.cwd();
var consulFactory = require( "./consul.js" );
var Watcher = require( "./Watcher.js" );

function readFile( prop ) {
	if ( prop && _.startsWith( prop, filePrefix ) ) {
		var filePath = path.resolve( cwd, prop.slice( filePrefix.length ) );
		log.debug( "Reading file: %s", filePath );
		return fs.readFileSync( filePath, "utf-8" );
	}

	return prop;
}

function getConsulConfig( config ) {
	var cfg = config.consul;

	log.debug( "Consul Configuration: " );
	log.debug( JSON.stringify( cfg, null, 2 ) );

	if ( !cfg ) {
		return null;
	}

	cfg.ca = readFile( cfg.ca );
	cfg.cert = readFile( cfg.cert );
	cfg.key = readFile( cfg.key );

	return cfg;
}

function setupWatchers( consul, config ) {
	var baseCfg;
	var instanceCfg;
	var configurations = _.reduce( config.watch, function( memo, typeConfig, type ) {
		baseCfg = {
			type: type,
			adapters: typeConfig.adapters
		};

		_.each( typeConfig.instances, function( instance ) {
			instanceCfg = _.merge( _.cloneDeep( baseCfg ), instance );
			memo.push( instanceCfg );
		} );

		return memo;
	}, [] );

	var watchers = _.map( configurations, function( cfg ) {
		return new Watcher( consul, cfg );
	} );

	return watchers;

}

function setupAdapters( config ) {
	var folder = __dirname + "/adapters";
	var adapters = fs.readdirSync( folder );

	_.each( adapters, function( a ) {
		require( folder + "/" + a )( config );
	} );
}

function watch( config ) {
	log.info( "Starting watch service" );
	var consulCfg = getConsulConfig( config );
	var consul = consulFactory( consulCfg );

	setupAdapters( config );

	var watchers = setupWatchers( consul, config );

	return watchers;
}

// Attaching some functions to export for testing purposes
watch.setupWatchers = setupWatchers;
watch.getConsulConfig = getConsulConfig;
watch.readFile = readFile;

module.exports = watch;
