use crate::dbus::DBusArguments;

use super::dbus::DBusClient;
use axum::{
    http::{header, StatusCode},
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::{json, Value};
use zbus::zvariant;

pub async fn ping() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

#[derive(Deserialize)]
pub struct GetProperty {
    pub service: String,
    pub path: String,
    pub iface: String,
    pub property: String,
}

pub async fn get_property(Json(payload): Json<GetProperty>) -> impl IntoResponse {
    let client = DBusClient::with_default_connection().await;
    let msg = client
        .get_property(
            &payload.service,
            &payload.path,
            &payload.iface,
            &payload.property,
        )
        .await;
    let body: zvariant::Structure = msg.body().unwrap();
    let body = serde_json::to_string(&body).unwrap();
    ([(header::CONTENT_TYPE, "application/json")], body)
}

#[derive(Deserialize)]
pub struct SetProperty {
    pub service: String,
    pub path: String,
    pub iface: String,
    pub property: String,
    pub value: zvariant::OwnedValue,
}

pub async fn set_property(Json(payload): Json<SetProperty>) -> impl IntoResponse {
    let client = DBusClient::with_default_connection().await;
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

pub async fn call_dbus(Json(payload): Json<CallMethod>) -> impl IntoResponse {
    let client = DBusClient::with_default_connection().await;
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

    let body: zvariant::Structure = msg.body().unwrap();
    let body = serde_json::to_string(&body).unwrap();
    ([(header::CONTENT_TYPE, "application/json")], body)
}
