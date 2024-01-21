use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AgamaServerError {
    #[error("D-Bus conversion error: {0}")]
    DBusConversionError(#[from] zbus::Error),
    #[error("JSON conversion error: {0}")]
    JsonConversionError(#[from] serde_json::Error),
}

impl IntoResponse for AgamaServerError {
    fn into_response(self) -> Response {
        (
            StatusCode::BAD_REQUEST,
            format!("Something went wrong: {}", self),
        )
            .into_response()
    }
}
