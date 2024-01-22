use agama_lib::error::ServiceError;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AgamaServerError {
    #[error("D-Bus conversion error: {0}")]
    DBusConversion(#[from] zbus::Error),
    #[error("JSON conversion error: {0}")]
    JsonConversion(#[from] serde_json::Error),
    #[error("D-Bus connection error: {0}")]
    DBus(#[from] ServiceError),
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
