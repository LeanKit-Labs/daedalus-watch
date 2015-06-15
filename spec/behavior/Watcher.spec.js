require( '../setup.js' );

var _ = require( 'lodash' );
var postal = require( 'postal' );
var Watcher;

describe( 'Watcher Objects', function() {

	before( function() {
		Watcher = require( '../../src/Watcher.js' );
	} );

	describe( 'when an ACL token is present', function() {
		var w;
		before( function() {
			w = new Watcher( { ACL_TOKEN: 'abc' }, {
				start: false,
				options: {
					key: 'value'
				}
			} );
		} );
		it( 'should attach it to the watcher options', function() {
			w.options.should.eql( {
				token: 'abc',
				key: 'value'
			} );
		} );

	} );

	describe( 'when the instance to cast to an object', function() {
		var w;
		var expected;
		before( function() {
			var config = {
				start: false,
				name: 'myWatcher',
				type: 'myMethod',
				options: {
					id: '123'
				},
				adapters: {
					rabbit: {
						exchange: 'myExchange'
					}
				}
			};
			var lastUpdate = {
				key: 'value1'
			};

			expected = _.cloneDeep( config );
			delete expected.start;

			expected.lastUpdate = _.clone( lastUpdate );

			w = new Watcher( {}, config );

			w.lastUpdate = lastUpdate;
		} );

		it( 'should serialize the object properly', function() {
			w.toObject().should.eql( expected );
		} );

	} );

	describe( 'when a change event occurs', function() {

		describe( 'when the change is not actually a difference', function() {

			var w;
			var channel;
			var msgReceived = false;

			before( function( done ) {
				channel = postal.channel( 'watcher' );

				var sub = channel.subscribe( {
					topic: '#',
					callback: function() {
						msgReceived = true;
						done();
					}
				} ).once();

				w = new Watcher( {}, {
					start: false,
					type: 'kv.get',
					name: 'settings'
				} );

				var update = {
					key1: 'value1'
				};

				w.lastUpdate = update;

				w.onChange( update );

				setTimeout( function() {
					sub.unsubscribe();
					done();
				}, 100 );

			} );

			it( 'should not publish a change message', function() {
				msgReceived.should.not.be.ok;
			} );

		} );

		describe( 'when the change is different from last update', function() {
			var w;
			var channel;
			var msgReceived = false;
			var update;
			var previousUpdate;

			before( function( done ) {
				channel = postal.channel( 'watcher' );

				var sub = channel.subscribe( {
					topic: '#',
					callback: function( data ) {
						msgReceived = data;
						done();
					}
				} ).once();

				w = new Watcher( {}, {
					start: false,
					type: 'kv.get',
					name: 'settings'
				} );

				previousUpdate = {
					otherkey: 'somethingelse'
				};

				w.lastUpdate = previousUpdate;

				update = {
					key1: 'value1'
				};

				w.onChange( update );

			} );

			it( 'should publish a change message', function() {
				var serialized = w.toObject();
				serialized.lastUpdate = previousUpdate;

				msgReceived.watcher.should.eql( serialized );
				msgReceived.data.should.eql( update );
			} );
		} );

	} );

} );
