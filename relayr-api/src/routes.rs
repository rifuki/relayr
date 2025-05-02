use axum::Router;

use crate::relay::routes::relay_router;

pub fn app_routes() -> Router {
    Router::new().nest("/relay", relay_router())
}
