use axum::{Router, routing::get};

use super::{handlers, state::RelayState};

pub fn relay_router() -> Router {
    Router::new()
        .route("/", get(handlers::handle_relay_ws_upgrade))
        .route(
            "/file-meta/{sender_id}",
            get(handlers::handle_get_file_metadata),
        )
        .route("/debug/state", get(handlers::handle_debug_state))
        .route("/ping", get(handlers::handle_ping))
        .with_state(RelayState::new())
}
