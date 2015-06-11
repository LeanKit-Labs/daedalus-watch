var consul = require( 'consul' ),
	_ = require( 'lodash' ),
	lift = require( 'when/node' ).lift;

var connection;

var toLift = [
	'kv.get', 'kv.keys', 'kv.set', 'kv.del',
	'acl.create', 'acl.update', 'acl.destroy', 'acl.info', 'acl.clone', 'acl.list',
	'agent.check.list', 'agent.check.register', 'agent.check.deregister',
	'agent.check.pass', 'agent.check.warn', 'agent.check.fail',
	'agent.service.list', 'agent.service.register', 'agent.service.deregister', 'agent.service.maintenance',
	'agent.members', 'agent.self', 'agent.maintenance', 'agent.join', 'agent.forceLeave',
	'catalog.datacenters', 'catalog.node.list', 'catalog.node.services',
	'catalog.service.list', 'catalog.service.nodes',
	'health.service', 'health.node', 'health.checks', 'health.state'
];

function getConsulClient( options ) {
	var client = consul( options );
	var lifted;
	_.each( toLift, function( path ) {
		lifted = lift( _.get( client, path ) );
		_.set( client, path, lifted );
	} );

	if ( options.token ) {
		client.ACL_TOKEN = options.token;
	}

	return client;
}

module.exports = function( config ) {
	if ( connection ) {
		return connection;
	}

	connection = getConsulClient( config );
	return connection;
};
