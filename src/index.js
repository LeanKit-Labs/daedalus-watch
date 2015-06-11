var watch = require( "./watch.js" );

module.exports = watch;

if ( ! module.parent ) {
	var config = require( "configya" )( {
		file: __dirname + "/../config.json"
	} );

	watch( config );
}
