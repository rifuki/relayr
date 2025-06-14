use std::fmt;

use axum::extract::ws::Message;
use chrono::Utc;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ErrorCode {
    InvalidPayload,

    SenderAlreadyConnected,
    SenderDisconnected,
    RecipientDisconnected,

    ActiveConnectionNotFound,
    RecipientMismatch,

    UnsupportedWsMessageType,
    UnsupportedWsMessageTextType,

    NotHandledYet,
    Unknown,
}

#[derive(Serialize)]
pub struct ErrorMessage {
    pub success: bool,
    pub code: ErrorCode,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    pub timestamp: i64,
}

impl ErrorMessage {
    pub fn new(code: ErrorCode, msg: &str) -> Self {
        Self {
            success: false,
            code,
            message: msg.to_owned(),
            details: None,
            timestamp: Utc::now().timestamp(),
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
