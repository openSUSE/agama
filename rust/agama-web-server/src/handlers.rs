use super::dbus::DBusClient;
use crate::{dbus::DBusArguments, error::AgamaServerError, AppState};
use agama_lib::product::{Product, ProductClient};
use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
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

pub async fn get_products(
    State(state): State<AppState>,
) -> Result<Json<Vec<Product>>, AgamaServerError> {
    let client = ProductClient::new(state.connection).await?;
    Ok(Json(client.products().await?))
}

pub async fn ws_handler(State(state): State<AppState>, ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state.connection))
}

pub async fn handle_socket(mut socket: WebSocket, connection: zbus::Connection) {
    let rule = MatchRule::builder()
        .msg_type(zbus::MessageType::Signal)
        .build();
    let mut stream = MessageStream::for_match_rule(rule, &connection, Some(10))
        .await
        .unwrap();

    while let Some(msg) = stream.next().await {
        let msg = msg.unwrap();
        let body: zbus::zvariant::Structure = msg.body().unwrap();
        let payload = serde_json::to_string(&body).unwrap();
        _ = socket.send(Message::Text(payload)).await;
    }
}
