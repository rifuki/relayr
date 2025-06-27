use axum::{
    Json,
    extract::{Path, Query, State, WebSocketUpgrade},
    http::StatusCode,
    response::IntoResponse,
};

use crate::feature::relay::{
    types::{FileMetadata, RelayQueryParams},
    ws::socket::handle_socket,
};

use super::state::RelayState;

pub async fn handle_relay_ws_upgrade(
    ws: WebSocketUpgrade,
    State(state): State<RelayState>,
    Query(params): Query<RelayQueryParams>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state, params.id))
}

pub async fn handle_get_file_metadata(
    Path(sender_id): Path<String>,
    State(state): State<RelayState>,
) -> Result<Json<FileMetadata>, StatusCode> {
    if let Some(file_meta) = state.get_file_metadata(&sender_id).await {
        Ok(Json(file_meta))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

pub async fn handle_ping() -> &'static str {
    "pong"
}

pub async fn handle_debug_state(State(state): State<RelayState>) -> String {
    format!("{:#?}", state)
}
