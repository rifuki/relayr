use axum::{Router, routing::get};

use super::{
    handlers::{check_state_handler, get_file_meta_handler, relay_handler},
    state::RelayState,
};

pub fn relay_router() -> Router {
    Router::new()
        .route("/", get(relay_handler))
        .route("/file-meta/{sender_id}", get(get_file_meta_handler))
        .route("/check/state", get(check_state_handler))
        .with_state(RelayState::new())
}
