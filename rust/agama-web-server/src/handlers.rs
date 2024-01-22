use super::dbus::DBusClient;
use crate::{dbus::DBusArguments, error::AgamaServerError};
use agama_lib::{
    connection,
    product::{Product, ProductClient},
};
use axum::{
    extract::{
        ws::{Message, WebSocket},
        WebSocketUpgrade,
    },
    http::{header, StatusCode},
    response::IntoResponse,
    Json,
};
use futures_util::StreamExt;
use serde::Deserialize;
use serde_json::{json, Value};
use zbus::{zvariant, MatchRule, MessageStream};

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

pub async fn get_property(
    Json(payload): Json<GetProperty>,
) -> Result<impl IntoResponse, AgamaServerError> {
    let client = DBusClient::with_default_connection().await;
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

pub async fn call_dbus(
    Json(payload): Json<CallMethod>,
) -> Result<impl IntoResponse, AgamaServerError> {
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

    let body: zvariant::Structure = msg.body()?;
    let body = serde_json::to_string(&body)?;
    Ok(([(header::CONTENT_TYPE, "application/json")], body))
}

pub async fn get_products() -> Result<Json<Vec<Product>>, AgamaServerError> {
    let conn = connection().await?;
    let client = ProductClient::new(conn).await?;
    Ok(Json(client.products().await?))
}

pub async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

pub async fn handle_socket(mut socket: WebSocket) {
    let rule = MatchRule::builder()
        .msg_type(zbus::MessageType::Signal)
        .build();
    let conn = connection().await.unwrap();
    let mut stream = MessageStream::for_match_rule(rule, &conn, Some(10))
        .await
        .unwrap();

    while let Some(msg) = stream.next().await {
        let msg = msg.unwrap();
        let body: zbus::zvariant::Structure = msg.body().unwrap();
        let payload = serde_json::to_string(&body).unwrap();
        _ = socket.send(Message::Text(payload)).await;
    }
}
