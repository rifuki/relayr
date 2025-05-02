use std::fmt;

use axum::extract::ws::Message;
use serde::Serialize;

#[derive(Serialize)]
pub struct ErrorMessage {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

impl ErrorMessage {
    pub fn new(msg: &str) -> Self {
        Self {
            success: false,
            message: msg.to_owned(),
            details: None,
        }
    }

    pub fn with_details(mut self, details: &str) -> Self {
        self.details = Some(details.to_owned());
        self
    }
}

impl ErrorMessage {
    pub fn to_ws_msg(&self) -> Message {
        Message::text(self.to_string())
    }
}

impl fmt::Display for ErrorMessage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match serde_json::to_string(self) {
            Ok(json) => write!(f, "{json}"),
            Err(e) => {
                tracing::error!(error = %e, "failed to serialize ErrorMessage");
                write!(
                    f,
                    "{{\"success\": false, \"message\": \"internal serialization error\"}}"
                )
            }
        }
    }
}
