use axum::{
    extract::{Path, Query, State, WebSocketUpgrade},
    http::StatusCode,
    response::IntoResponse,
};

use crate::{
    common::response::{ApiResponse, AppError, AppResult},
    feature::relay::{
        types::{FileMetadata, RelayQueryParams},
        ws::socket::handle_socket,
    },
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
) -> AppResult<FileMetadata> {
    if let Some(file_meta) = state.get_file_metadata(&sender_id).await {
        Ok(ApiResponse::default().with_data(file_meta))
    } else {
        Err(AppError::default()
            .with_code(StatusCode::NOT_FOUND)
            .with_message("File metadata not found"))
    }
}

pub async fn handle_ping() -> AppResult<String> {
    Ok(ApiResponse::default().with_data("pong".to_string()))
}

pub async fn handle_debug_state(State(state): State<RelayState>) -> AppResult<String> {
    Ok(ApiResponse::default().with_data(format!("{:#?}", state)))
}
