use std::time::Duration;

use axum::{Json, Router, http::StatusCode, routing::get};
use serde_json::{Value as SerdeJson, json};

use crate::config::CONFIG;
use crate::relay::routes::relay_router;

pub fn app_routes() -> Router {
    Router::new()
        .nest(
            "/api/v1",
            Router::new().nest(
                "/relay",
                Router::new()
                    .merge(relay_router())
                    .route("/ping", get(ping)),
            ),
        )
        .route("/health", get(check_health))
}

async fn check_health() -> (StatusCode, Json<SerdeJson>) {
    let start_time = std::time::SystemTime::now();
    let uptime = start_time
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0));

    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION"),
            "uptime_seconds": uptime.as_secs(),
            "environment": CONFIG.rust_env,
            "memory_usage": {
                "total": sys_info::mem_info().map_or(0, |m| m.total),
                "free": sys_info::mem_info().map_or(0, |m| m.free),
                "used": sys_info::mem_info().map_or(0, |m| m.total - m.free),
                "available": sys_info::mem_info().map_or(0, |m| m.avail)
            }
        })),
    )
}

async fn ping() -> &'static str {
    "pong"
}
