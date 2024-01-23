# Agama Web Server

**DISCLAIMER: this is just for demonstration purposes. It opens port 3000 (in localhost)
which runs as root and does not have any kind of authentication. So, please, us it at your own risk.**

The [web-server](https://github.com/openSUSE/agama/tree/web-server) branch implements a simple HTTP
server which exposes a tiny part of the Agama API. It is just a proof-of-concept to find out whether
we can replace Cockpit with a regular HTTP server/client architecture.

The `agama-web-server` Rust package implements the server and the [agama-web-server/ui] directory
contains an example React client.

## Running the server

To run the server, you need to build the package and start it as root:

```
cd rust/agama-web-server
cargo build
sudo ../agama-web-server
```

Now you can see the demo application pointing your browser to `http://localhost:3000/`.

## Executing shell-based examples

The [examples] directory contains some examples to use from the command-line. Refer to the
[examples/run.sh] file to find out more details.

## To do

At this point, it is just a PoC and the idea is to implement, more or less, the following features:

- [x] Add a /ping endpoint.
- [x] Allow calling raw D-Bus methods through HTTP.
- [x] Receive D-Bus events via WebSockets.
- [x] Expose part of the API (e.g., products) as a regular HTTP API (REST?).
- [ ] Receive higher-level events via WebSockets (e.g., a product is selected).
- [ ] Authentication and authorization.
