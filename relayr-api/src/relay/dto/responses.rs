use axum::extract::ws::Message;
use chrono::Utc;
use serde::Serialize;
use std::fmt;

use crate::impl_response_dto;

// Define a trait for shared functionality
pub trait WsResponse {
    fn to_ws_msg(&self) -> Message;
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub conn_id: String,
    pub timestamp: i64,
}
impl RegisterResponseDto {
    pub fn new(conn_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "register".to_string(),
            conn_id: conn_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_response_dto!(RegisterResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecipientReadyResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub recipient_id: String,
    pub timestamp: i64,
}
impl RecipientReadyResponseDto {
    pub fn new(recipient_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "recipientReady".to_string(),
            recipient_id: recipient_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_response_dto!(RecipientReadyResponseDto);

//#[derive(Debug, Serialize)]
//#[serde(rename_all = "camelCase")]
//pub struct FileMetaResponseDto {
//    pub success: bool,
//    #[serde(rename = "type")]
//    pub msg_type: String,
//    pub file_name: String,
//    pub file_size: u64,
//    pub mime_type: String,
//    pub timestamp: i64,
//}
//impl FileMetaResponseDto {
//    pub fn new(file_name: &str, file_size: u64, mime_type: &str) -> Self {
//        Self {
//            success: true,
//            msg_type: "fileMeta".to_owned(),
//            file_name: file_name.to_owned(),
//            file_size,
//            mime_type: mime_type.to_owned(),
//            timestamp: Utc::now().timestamp(),
//        }
//    }
//}
//impl_response_dto!(FileMetaResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelRecipientReadyResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub recipient_id: String,
    pub timestamp: i64,
}
impl CancelRecipientReadyResponseDto {
    pub fn new(recipient_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "cancelRecipientReady".to_string(),
            recipient_id: recipient_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_response_dto!(CancelRecipientReadyResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelSenderReadyResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
    pub timestamp: i64,
}
impl CancelSenderReadyResponseDto {
    pub fn new(sender_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "cancelSenderReady".to_string(),
            sender_id: sender_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_response_dto!(CancelSenderReadyResponseDto);
