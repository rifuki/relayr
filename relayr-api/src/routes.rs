use std::time::Duration;

use axum::{Json, Router, http::StatusCode, routing::get};
use serde_json::{Value as SerdeJson, json};

use crate::{config::CONFIG, features::relay::routes::relay_router};

pub fn app_routes() -> Router {
    Router::new()
        .nest("/api/v1", Router::new().nest("/relay", relay_router()))
        .route("/health", get(check_health))
}

async fn check_health() -> (StatusCode, Json<SerdeJson>) {
    let start_time = std::time::SystemTime::now();
    let uptime = start_time
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0));

    let mem = sys_info::mem_info().ok();
    let disk = sys_info::disk_info().ok();
    let cpu_num = sys_info::cpu_num().unwrap_or(0); // jumlah core
    let load = sys_info::loadavg().ok();
    let proc_total = sys_info::proc_total().unwrap_or(0);
    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION"),
            "uptime_seconds": uptime.as_secs(),
            "environment": CONFIG.rust_env,
            "memory_usage": {
                "total": mem.as_ref().map(|m| m.total).unwrap_or(0),
                "free": mem.as_ref().map(|m| m.free).unwrap_or(0),
                "used": mem.as_ref().map(|m| m.total - m.free).unwrap_or(0),
                "available": mem.as_ref().map(|m| m.avail).unwrap_or(0)
            },
            "disk": {
                "total": disk.as_ref().map(|d| d.total).unwrap_or(0),
                "free": disk.as_ref().map(|d| d.free).unwrap_or(0)
            },
            "cpu": {
                "num_cores": cpu_num,
                "load_avg_1min": load.as_ref().map(|l| l.one).unwrap_or(0.0),
                "load_avg_5min": load.as_ref().map(|l| l.five).unwrap_or(0.0),
                "load_avg_15min": load.as_ref().map(|l| l.fifteen).unwrap_or(0.0)
            },
            "processes": {
                "total": proc_total
            }
        })),
    )
}
