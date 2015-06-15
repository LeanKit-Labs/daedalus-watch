#daedalus-watch

## Pre-alpha. Use at your own risk.

A monitoring service for Consul that sets up watches and reports changes to RabbitMQ.

## Usage

Create a `config.json` file based on the sample provided.

```bash
$ node src/index.js
```

## Try it out

A sample `Vagrantfile` is provided that will create a virtual machine with Consul and RabbitMQ installed. The sample configuration file will provide the correct connection configuration for using the virtual machine.

**Important:** Because this setup uses TLS encryption with certificates, the Consul agent must be accessed via the correct hostname. Add this line to your `hosts` file:

```
127.0.0.1	consul-agent1.leankit.com
```

Copy the sample configuration and Vagrant files and get started:

```bash
$ cp config.sample.json config.json
$ cp Vagrantfile.sample Vagrantfile
$ vagrant up
$ gulp # Run the tests
```

Once the Vagrant box is up, you can start the service as described above and manipulate Consul and RabbitMQ using their web interfaces.

* Consul UI: [http://localhost:8505/ui](http://localhost:8505/ui)
* RabbitMQ UI: [http://localhost:15672](http://localhost:15672)
	* User/pass: guest/guest
