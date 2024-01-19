# Agama Web Server

The purpose of this crate is to expose Agama API using HTTP and WebSockets.

## To do

At this point, it is just a PoC and the idea is to implement, more or less, the following features:

- [ ] Add a /ping endpoint.
- [ ] Allow calling raw D-Bus methods through HTTP.
- [ ] Receive D-Bus events via WebSockets.
- [ ] Expose part of the API (e.g., products) as a regular HTTP API (REST?).
- [ ] Receive higher-level events via WebSockets (e.g., a product is selected).
- [ ] Authentication and authorization.
