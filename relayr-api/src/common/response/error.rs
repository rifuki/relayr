use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use chrono::Utc;
use serde::Serialize;

#[derive(Serialize)]
pub struct Errors {
    pub message: String,
    pub code: u16,
    pub timestamp: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

#[derive(Serialize)]
pub struct AppError {
    pub success: bool,
    pub errors: Errors,
}

// Idiomatic implementation of `Default`.
// Delegates to `Self::new()` to enable standard default instance creation
impl Default for AppError {
    fn default() -> Self {
        Self {
            success: false,
            errors: Errors {
                message: "".to_owned(),
                code: 500,
                timestamp: Utc::now().timestamp(),
                details: None,
            },
        }
    }
}

// --- Builder Methods ---
impl AppError {
    pub fn with_message(mut self, message: String) -> Self {
        self.errors.message = message;
        self
    }
    pub fn with_code(mut self, code: StatusCode) -> Self {
        self.errors.code = code.as_u16();
        self
    }
    pub fn with_details(mut self, details: String) -> Self {
        self.errors.details = Some(details);
        self
    }
}

// --- IntoResponse Implementation ---
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status_code =
            StatusCode::from_u16(self.errors.code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
        let body = Json(self);

        (status_code, body).into_response()
    }
}
