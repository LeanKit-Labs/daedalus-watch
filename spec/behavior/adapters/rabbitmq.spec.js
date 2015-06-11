require( "../../setup.js" );

var rabbit;
var postal = require( "postal" );

describe( "RabbitMQ Adapter", function() {

	before( function() {
		rabbit = require( "../../../src/adapters/rabbitmq.js" );
	} );

	describe( "when a change event is received", function() {

		var configure;
		var configuration;
		var publish;
		var adapter;
		var watcher;
		var change;
		before( function() {
			var wascally = require( "wascally" );

			configure = sinon.stub( wascally, "configure" );
			publish = sinon.stub( wascally, "publish" );

			configuration = {
				rabbitmq: {
					connection: {
						host: "localhost"
					}
				}
			};

			adapter = rabbit( configuration );

			channel = postal.channel( "watcher" );

			watcher = {
				type: "service.health",
				name: "riak",
				adapters: {
					rabbitmq: {
						exchange: "service.health.events"
					}
				}
			};

			change = {
				id: "riak0",
				name: "riak"
			};

			channel.publish( {
				topic: "change",
				data: {
					watcher: watcher,
					data: change
				}
			} );

		} );

		after( function() {
			adapter.stop();
		} );

		it( "should configure wascally correctly", function() {
			configure.should.have.been.calledWith( configuration.rabbitmq );
		} );

		it( "should publish a message to RabbitMQ", function() {
			publish.should.have.been.calledWith( "service.health.events", {
				routingKey: "service.health.riak.change",
				body: change
			} );
		} );

	} );

} );
