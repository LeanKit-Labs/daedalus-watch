require( '../setup.js' );

var _ = require( 'lodash' );
var postal = require( 'postal' );
var Watcher;
var consul;

describe( 'Watcher Integration Tests', function() {

	before( function( done ) {
		Watcher = require( '../../src/Watcher.js' );
		consul = require( '../../src/consul.js' )( consulCfg );

		consul.kv.set( {
			key: 'timeout-configuration',
			value: JSON.stringify( {
				host: 'localhost'
			} )
		} ).then( function() {
			done();
		} );

	} );

	describe( 'when the watch instance times out', function() {
		var w;
		var channel;
		var msgReceived = [];
		var update;
		var previousUpdate;

		before( function( done ) {
			this.timeout( 6000 );

			channel = postal.channel( 'watcher' );

			var sub = channel.subscribe( {
				topic: 'change',
				callback: function( data ) {
					msgReceived.push( data );
					setTimeout( function() {
						if ( msgReceived.length > 1 ) {
							done();
						}
					}, 1000 );
				}
			} );

			w = new Watcher( consul, {
				type: 'kv.get',
				name: 'configuration',
				options: {
					key: 'timeout-configuration',
					wait: '1s'
				}
			} );

			setTimeout( function() {
				consul.kv.set( {
					key: 'timeout-configuration',
					value: JSON.stringify( {
						host: 'http://otherserver.com'
					} )
				} );
			}, 3000 );

		} );

		it( 'should reconnect and receive changes', function() {
			msgReceived.length.should.equal( 2 );
		} );
	} );

} );
