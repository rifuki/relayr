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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileChunkResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
    pub file_name: String,
    pub total_chunks: u16,
    pub total_size: u64,
    pub chunk_index: u32,
    pub uploaded_size: u64,
    pub chunk_data_size: u32,
    pub transfer_progress: u8,
}

impl FileChunkResponseDto {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        sender_id: &str,
        file_name: &str,
        total_chunks: u16,
        total_size: u64,
        chunk_index: u32,
        uploaded_size: u64,
        chunk_data_size: u32,
        transfer_progress: u8,
    ) -> Self {
        Self {
            success: true,
            msg_type: "fileChunk".to_owned(),
            sender_id: sender_id.to_owned(),
            file_name: file_name.to_owned(),
            total_chunks,
            total_size,
            chunk_index,
            uploaded_size,
            chunk_data_size,
            transfer_progress,
        }
    }
}
impl_response_dto!(FileChunkResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileTransferAckResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub recipient_id: String,
    pub status: String,
    pub file_name: String,
    pub total_chunks: u16,
    pub chunk_index: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chunk_data_size: Option<u32>,
    pub uploaded_size: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transfer_progress: Option<u8>,
}

impl FileTransferAckResponseDto {
    pub fn new(
        recipient_id: &str,
        status: &str,
        file_name: &str,
        total_chunks: u16,
        chunk_index: u32,
        uploaded_size: u64,
    ) -> Self {
        Self {
            success: true,
            msg_type: "fileTransferAck".to_owned(),
            recipient_id: recipient_id.to_owned(),
            status: status.to_owned(),
            file_name: file_name.to_owned(),
            total_chunks,
            chunk_index,
            chunk_data_size: None,
            uploaded_size,
            transfer_progress: None,
        }
    }

    pub fn chunk_data_size(mut self, chunk_data_size: Option<u32>) -> Self {
        self.chunk_data_size = chunk_data_size;
        self
    }

    pub fn transfer_progress(mut self, transfer_progress: Option<u8>) -> Self {
        self.transfer_progress = transfer_progress;
        self
    }
}
impl_response_dto!(FileTransferAckResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEndResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub file_name: String,
    pub total_chunks: u16,
    pub total_size: u64,
    pub last_chunk_index: u32,
    pub uploaded_size: u64,
}
impl FileEndResponseDto {
    pub fn new(
        file_name: &str,
        total_chunks: u16,
        total_size: u64,
        last_chunk_index: u32,
        uploaded_size: u64,
    ) -> Self {
        Self {
            success: true,
            msg_type: "fileEnd".to_owned(),
            file_name: file_name.to_owned(),
            total_chunks,
            total_size,
            last_chunk_index,
            uploaded_size,
        }
    }
}
impl_response_dto!(FileEndResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelSenderTransferResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
}
impl CancelSenderTransferResponseDto {
    pub fn new(sender_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "cancelSenderRecipient".to_owned(),
            sender_id: sender_id.to_owned(),
        }
    }
}
impl_response_dto!(CancelSenderTransferResponseDto);
