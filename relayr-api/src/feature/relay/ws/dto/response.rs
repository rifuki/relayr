use axum::extract::ws::Message;
use chrono::Utc;
use serde::Serialize;
use std::fmt;

use crate::impl_ws_text_response;

// Define a trait for shared functionality
pub trait AsWsTextMessage {
    fn as_ws_text_message(&self) -> Message;
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
impl_ws_text_response!(RegisterResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecipientReadyResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub recipient_id: String,
    pub sender_id: String,
    pub timestamp: i64,
}
impl RecipientReadyResponseDto {
    pub fn new(recipient_id: &str, sender_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "recipientReady".to_string(),
            recipient_id: recipient_id.to_owned(),
            sender_id: sender_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(RecipientReadyResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelRecipientReadyResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub recipient_id: String,
    pub sender_id: String,
    pub timestamp: i64,
}
impl CancelRecipientReadyResponseDto {
    pub fn new(recipient_id: &str, sender_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "cancelRecipientReady".to_string(),
            recipient_id: recipient_id.to_owned(),
            sender_id: sender_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(CancelRecipientReadyResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelSenderReadyResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
    pub recipient_id: String,
    pub timestamp: i64,
}
impl CancelSenderReadyResponseDto {
    pub fn new(sender_id: &str, recipient_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "cancelSenderReady".to_string(),
            sender_id: sender_id.to_owned(),
            recipient_id: recipient_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(CancelSenderReadyResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileChunkResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
    pub recipient_id: String,
    pub file_name: String,
    pub total_size: u64,
    pub total_chunks: u16,
    pub uploaded_size: u64,
    pub chunk_index: u32,
    pub chunk_data_size: u32,
    pub sender_transfer_progress: u8,
    pub timestamp: i64,
}

impl FileChunkResponseDto {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        sender_id: &str,
        recipient_id: &str,
        file_name: &str,
        total_size: u64,
        total_chunks: u16,
        uploaded_size: u64,
        chunk_index: u32,
        chunk_data_size: u32,
        sender_transfer_progress: u8,
    ) -> Self {
        Self {
            success: true,
            msg_type: "fileChunk".to_owned(),
            sender_id: sender_id.to_owned(),
            recipient_id: recipient_id.to_owned(),
            file_name: file_name.to_owned(),
            total_size,
            total_chunks,
            uploaded_size,
            chunk_index,
            chunk_data_size,
            sender_transfer_progress,
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(FileChunkResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileTransferAckResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub recipient_id: String,
    pub sender_id: String,
    pub status: String,
    pub file_name: String,
    pub total_chunks: u16,
    pub uploaded_size: u64,
    pub chunk_index: u32,
    pub chunk_data_size: u32,
    pub recipient_transfer_progress: u8,
    pub timestamp: i64,
}

impl FileTransferAckResponseDto {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        recipient_id: &str,
        sender_id: &str,
        status: &str,
        file_name: &str,
        total_chunks: u16,
        uploaded_size: u64,
        chunk_index: u32,
        chunk_data_size: u32,
        recipient_transfer_progress: u8,
    ) -> Self {
        Self {
            success: true,
            msg_type: "fileTransferAck".to_owned(),
            recipient_id: recipient_id.to_owned(),
            sender_id: sender_id.to_owned(),
            status: status.to_owned(),
            file_name: file_name.to_owned(),
            total_chunks,
            uploaded_size,
            chunk_index,
            chunk_data_size,
            recipient_transfer_progress,
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(FileTransferAckResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEndResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
    pub recipient_id: String,
    pub file_name: String,
    pub total_size: u64,
    pub total_chunks: u16,
    pub uploaded_size: u64,
    pub last_chunk_index: u32,
    pub timestamp: i64,
}
impl FileEndResponseDto {
    pub fn new(
        sender_id: &str,
        recipient_id: &str,
        file_name: &str,
        total_size: u64,
        total_chunks: u16,
        uploaded_size: u64,
        last_chunk_index: u32,
    ) -> Self {
        Self {
            success: true,
            msg_type: "fileEnd".to_owned(),
            sender_id: sender_id.to_owned(),
            recipient_id: recipient_id.to_owned(),
            file_name: file_name.to_owned(),
            total_size,
            total_chunks,
            uploaded_size,
            last_chunk_index,
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(FileEndResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelSenderTransferResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
    pub recipient_id: String,
    pub timestamp: i64,
}
impl CancelSenderTransferResponseDto {
    pub fn new(sender_id: &str, recipient_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "cancelSenderTransfer".to_owned(),
            sender_id: sender_id.to_owned(),
            recipient_id: recipient_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(CancelSenderTransferResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelRecipientTransferResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub recipient_id: String,
    pub sender_id: String,
    pub timestamp: i64,
}
impl CancelRecipientTransferResponseDto {
    pub fn new(recipient_id: &str, sender_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "cancelRecipientTransfer".to_owned(),
            recipient_id: recipient_id.to_owned(),
            sender_id: sender_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(CancelRecipientTransferResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SenderAckResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub request_type: String,
    pub sender_id: String,
    pub recipient_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    pub timestamp: i64,
}
impl SenderAckResponseDto {
    pub fn new(
        request_type: &str,
        sender_id: &str,
        recipient_id: &str,
        message: Option<String>,
    ) -> Self {
        Self {
            success: true,
            msg_type: "senderAck".to_owned(),
            request_type: request_type.to_owned(),
            sender_id: sender_id.to_owned(),
            recipient_id: recipient_id.to_owned(),
            message,
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(SenderAckResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RestartTransferResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub sender_id: String,
    pub recipient_id: String,
    pub timestamp: i64,
}
impl RestartTransferResponseDto {
    pub fn new(sender_id: &str, recipient_id: &str) -> Self {
        Self {
            success: true,
            msg_type: "restartTransfer".to_owned(),
            sender_id: sender_id.to_owned(),
            recipient_id: recipient_id.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(RestartTransferResponseDto);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PeerDisconnectedResponseDto {
    pub success: bool,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub peer_id: String,
    pub role: String,
    pub timestamp: i64,
}
impl PeerDisconnectedResponseDto {
    pub fn new(peer_id: &str, role: &str) -> Self {
        Self {
            success: true,
            msg_type: "peerDisconnected".to_owned(),
            peer_id: peer_id.to_owned(),
            role: role.to_owned(),
            timestamp: Utc::now().timestamp(),
        }
    }
}
impl_ws_text_response!(PeerDisconnectedResponseDto);
