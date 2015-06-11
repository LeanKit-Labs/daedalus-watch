require( '../setup.js' );

var _ = require( 'lodash' );
var fs = require( 'fs' );

describe( 'Daedalus Watch Setup', function() {
	var watch;

	before( function() {
		watch = require( '../../src/watch.js' );
	} );

	describe( 'when reading a configuration file', function() {

		describe( 'when property does not have file protocol prefix', function() {

			it( 'should return original value', function() {
				var result = watch.readFile( 'something' );
				result.should.equal( 'something' );
			} );

		} );

		describe( 'when property does have file protocol prefix', function() {
			var readFile;
			var result;
			before( function() {
				readFile = sinon.stub( fs, 'readFileSync' ).returns( 'filecontents' );
				result = watch.readFile( 'file://some/file.key' );
			} );

			after( function() {
				readFile.restore();
			} );

			it( 'should return the file contents', function() {
				result.should.equal( 'filecontents' );
			} );

			it( 'should parse the file path correctly', function() {
				readFile.should.have.been.calledWith( process.cwd() + '/some/file.key' );
			} );

		} );

	} );

	describe( 'when getting the Consul configuration', function() {

		var readFile;
		var result;
		before( function() {
			readFile = sinon.stub( fs, 'readFileSync' ).returns( 'keystuff' );
			result = watch.getConsulConfig( {
				consul: {
					host: 'localhost',
					ca: 'file://root.cer',
					cert: 'file://cert.cer',
					key: 'file://cert.key'
				}
			} );
		} );

		after( function() {
			readFile.restore();
		} );

		it( 'should read the file contents of the certificate properties', function() {
			result.ca.should.equal( 'keystuff' );
			result.cert.should.equal( 'keystuff' );
			result.key.should.equal( 'keystuff' );
		} );

	} );

	describe( "when setting up watchers", function() {
		var config = {
			watch: {
				"health.service": {
					instances: [
						{
							name: "riak",
							start: false,
							options: {
								service: "riak"
							}
						},
						{
							name: "redis",
							start: false,
							options: {
								service: "redis"
							},
							adapters: {
								email: {
									address: "me@test.com"
								}
							}
						}
					],
					adapters: {
						rabbit: {
							exchange: "health.service.events"
						}
					}
				},
				"kv.get": {
					instances: [
						{
							name: "settings",
							start: false,
							options: {
								key: "config/settings"
							}
						}
					],
					adapters: {
						rabbit: {
							exchange: "keys.settings.change"
						}
					}
				}
			}
		};
		var results;
		before( function() {
			results = watch.setupWatchers( {}, config );
		} );

		it( "should setup a riak watcher", function() {
			var riak = _.find( results, { name: "riak" } );

			var obj = _.pick( riak, [ 'name', 'type', 'options', 'adapters' ] );

			obj.should.eql( {
				name: 'riak',
				type: 'health.service',
				adapters: {
					rabbit: {
						exchange: "health.service.events"
					}
				},
				options: {
					service: 'riak'
				}
			} );

		} );

		it( "should setup a redis watcher", function() {
			var redis = _.find( results, { name: "redis" } );

			var obj = _.pick( redis, [ 'name', 'type', 'options', 'adapters' ] );

			obj.should.eql( {
				name: 'redis',
				type: 'health.service',
				adapters: {
					rabbit: {
						exchange: "health.service.events"
					},
					email: {
						address: "me@test.com"
					}
				},
				options: {
					service: 'redis'
				}
			} );

		} );

		it( "should setup a settings watcher", function() {
			var settings = _.find( results, { name: "settings" } );

			var obj = _.pick( settings, [ 'name', 'type', 'options', 'adapters' ] );

			obj.should.eql( {
				name: 'settings',
				type: 'kv.get',
				adapters: {
					rabbit: {
						exchange: "keys.settings.change"
					}
				},
				options: {
					key: 'config/settings'
				}
			} );

		} );

	} );

} );
