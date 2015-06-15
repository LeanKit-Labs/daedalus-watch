var logger = require( '../src/logger' )( {
	adapters: {
		stdOut: {
			level: 0,
			bailIfDebug: true, // disables stdOut if DEBUG=* is in play
		},
		'debug': {
			level: 5
		}
	}
} );

var chai = require( 'chai' );
global.should = chai.should();
global.sinon = require( 'sinon' );

var sinonChai = require( 'sinon-chai' );
chai.use( sinonChai );

// Consul Setup
var fs = require( 'fs' );
global.consulCfg = {
	'host': 'consul-agent1.leankit.com',
	'port': 8500,
	'secure': true,
	'ca': fs.readFileSync( __dirname + '/../.consul/root.cer', 'utf-8' ),
	'cert': fs.readFileSync( __dirname + '/../.consul/consul-agent1.leankit.com/consul-agent1.leankit.com.cer', 'utf-8' ),
	'key': fs.readFileSync( __dirname + '/../.consul/consul-agent1.leankit.com/consul-agent1.leankit.com.key', 'utf-8' )
};
