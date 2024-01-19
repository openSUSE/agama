use axum::{routing::get, Json, Router};
use serde_json::{json, Value};

async fn ping() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/ping", get(ping));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:9091").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
