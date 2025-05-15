use axum::{
    Json,
    extract::{Path, Query, State, WebSocketUpgrade},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;

use super::{
    state::{FileMeta, RelayState},
    ws::handle_socket,
};

#[derive(Deserialize)]
pub struct QueryParams {
    pub id: String,
}

pub async fn relay_handler(
    ws: WebSocketUpgrade,
    State(state): State<RelayState>,
    Query(params): Query<QueryParams>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state, params.id))
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
