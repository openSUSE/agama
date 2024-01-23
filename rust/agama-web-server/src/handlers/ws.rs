use crate::AppState;
use agama_lib::progress::{Progress, ProgressMonitor, ProgressPresenter};
use async_trait::async_trait;
use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
};

pub async fn ws_handler(State(state): State<AppState>, ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state.connection))
}

async fn handle_socket(socket: WebSocket, connection: zbus::Connection) {
    let presenter = SocketProgressPresenter::new(socket);
    let mut monitor = ProgressMonitor::new(connection).await.unwrap();
    _ = monitor.run(presenter).await;
}

struct SocketProgressPresenter {
    socket: WebSocket,
}

impl SocketProgressPresenter {
    pub fn new(socket: WebSocket) -> Self {
        Self { socket }
    }

    pub async fn report_progress(&mut self, progress: &Progress) {
        let payload = serde_json::to_string(&progress).unwrap();
        _ = self.socket.send(Message::Text(payload)).await;
    }
}

#[async_trait]
impl ProgressPresenter for SocketProgressPresenter {
    async fn start(&mut self, progress: &Progress) {
        self.report_progress(progress).await;
    }

    async fn update_main(&mut self, progress: &Progress) {
        self.report_progress(progress).await;
    }

    async fn update_detail(&mut self, progress: &Progress) {
        self.report_progress(progress).await;
    }

    async fn finish(&mut self) {}
}
