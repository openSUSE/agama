use axum::{
    routing::{get, put},
    Router,
};

mod dbus;
mod error;
mod handlers;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/ping", get(handlers::ping))
        .route("/dbus/call", put(handlers::call_dbus))
        .route(
            "/dbus/properties",
            get(handlers::get_property).put(handlers::set_property),
        )
        .route("/products", get(handlers::get_products));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:9091").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
