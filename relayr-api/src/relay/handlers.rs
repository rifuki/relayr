use axum::{
    Json,
    extract::{Path, State, WebSocketUpgrade},
    http::StatusCode,
    response::IntoResponse,
};

use super::{
    state::{FileMeta, RelayState},
    ws::handle_socket,
};

pub async fn relay_handler(
    ws: WebSocketUpgrade,
    State(state): State<RelayState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

pub async fn get_file_meta_handler(
    Path(sender_id): Path<String>,
    State(state): State<RelayState>,
) -> Result<Json<FileMeta>, StatusCode> {
    if let Some(file_meta) = state.get_file_meta(&sender_id).await {
        Ok(Json(file_meta))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

pub async fn check_state_handler(State(state): State<RelayState>) -> String {
    format!("{:#?}", state)
}
