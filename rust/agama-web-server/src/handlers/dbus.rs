use crate::{
    dbus::{DBusArguments, DBusClient},
    error::AgamaServerError,
    AppState,
};
use axum::{
    extract::State,
    http::{header, StatusCode},
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use zbus::zvariant;

#[derive(Deserialize)]
pub struct GetProperty {
    pub service: String,
    pub path: String,
    pub iface: String,
    pub property: String,
}

pub async fn get_property(
    State(state): State<AppState>,
    Json(payload): Json<GetProperty>,
) -> Result<impl IntoResponse, AgamaServerError> {
    let client = DBusClient::new(state.connection);
    let msg = client
        .get_property(
            &payload.service,
            &payload.path,
            &payload.iface,
            &payload.property,
        )
        .await;
    let body: zvariant::Structure = msg.body()?;
    let body = serde_json::to_string(&body)?;
    Ok(([(header::CONTENT_TYPE, "application/json")], body))
}

#[derive(Deserialize)]
pub struct SetProperty {
    pub service: String,
    pub path: String,
    pub iface: String,
    pub property: String,
    pub value: zvariant::OwnedValue,
}

pub async fn set_property(
    State(state): State<AppState>,
    Json(payload): Json<SetProperty>,
) -> impl IntoResponse {
    let client = DBusClient::new(state.connection);
    client
        .set_property(
            &payload.service,
            &payload.path,
            &payload.iface,
            &payload.property,
            &payload.value,
        )
        .await;
    StatusCode::OK
}

#[derive(Deserialize, Debug)]
pub struct CallMethod {
    pub service: String,
    pub path: String,
    pub iface: String,
    pub method: String,
    pub args: Option<DBusArguments>,
}

pub async fn call_dbus(
    State(state): State<AppState>,
    Json(payload): Json<CallMethod>,
) -> Result<impl IntoResponse, AgamaServerError> {
    let client = DBusClient::new(state.connection);
    let msg = match &payload.args {
        Some(args) => {
            let structure = args.to_zvariant_structure();
            client
                .call_method(
                    &payload.service,
                    &payload.path,
                    &payload.iface,
                    &payload.method,
                    &structure,
                )
                .await
        }
        None => {
            client
                .call_method(
                    &payload.service,
                    &payload.path,
                    &payload.iface,
                    &payload.method,
                    &(),
                )
                .await
        }
    };

    let body: zvariant::Structure = msg.body()?;
    let body = serde_json::to_string(&body)?;
    Ok(([(header::CONTENT_TYPE, "application/json")], body))
}
