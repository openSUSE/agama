use axum::{
    http::Method,
    routing::{get, put},
    Router,
};
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};

mod dbus;
mod error;
mod handlers;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::PUT, Method::OPTIONS, Method::HEAD])
        .allow_headers([axum::http::header::CONTENT_TYPE]);

    let serve_dir = ServeDir::new("assets").append_index_html_on_directories(true);

    let app = Router::new()
        .fallback_service(serve_dir)
        .route("/ping", get(handlers::ping))
        .route("/dbus/call", put(handlers::call_dbus))
        .route(
            "/dbus/properties",
            get(handlers::get_property).put(handlers::set_property),
        )
        .route("/products", get(handlers::get_products))
        .route("/ws", get(handlers::ws_handler))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}
