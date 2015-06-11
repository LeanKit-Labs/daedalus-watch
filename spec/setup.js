var logger = require( "../src/logger" )( {
	adapters: {
		stdOut: {
			level: 0,
			bailIfDebug: true, // disables stdOut if DEBUG=* is in play
		},
		"debug": {
			level: 5
		}
	}
} );

var chai = require( 'chai' );
global.should = chai.should();
global.sinon = require( 'sinon' );
var sinonChai = require( 'sinon-chai' );
chai.use( sinonChai );
