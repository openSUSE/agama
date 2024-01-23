use agama_lib::product::{Product, ProductClient};
use axum::{extract::State, Json};
use serde_json::{json, Value};

use crate::{error::AgamaServerError, AppState};

pub async fn ping() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

pub async fn get_products(
    State(state): State<AppState>,
) -> Result<Json<Vec<Product>>, AgamaServerError> {
    let client = ProductClient::new(state.connection).await?;
    Ok(Json(client.products().await?))
}
