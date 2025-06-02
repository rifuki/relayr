use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "type")]
pub enum RelayIncomingPayload {
    #[serde(rename = "register")]
    Register(RegisterPayload),
    #[serde(rename = "recipientReady")]
    RecipientReady(RecipientReadyPayload),
    #[serde(rename = "fileMeta")]
    FileMeta(FileMetaPayload),
    #[serde(rename = "cancelRecipientReady")]
    CancelRecipientReady(CancelRecipientReadyPayload),
    #[serde(rename = "cancelSenderReady")]
    CancelSenderReady(CancelSenderReadyPayload),
    #[serde(rename = "fileChunk")]
    FileChunk(FileChunkPayload),
    #[serde(rename = "fileTransferAck")]
    FileTransferAck(FileTransferAckPayload),
    #[serde(rename = "fileEnd")]
    FileEnd(FileEndPayload),
    #[serde(rename = "cancelSenderTransfer")]
    CancelSenderTransfer(CancelSenderTransferPayload),
    #[serde(rename = "cancelRecipientTransfer")]
    CancelRecipientTransfer(CancelRecipientTransferPayload),
    #[serde(rename = "senderAck")]
    SenderAck(SenderAckPayload),
    #[serde(rename = "recipientAck")]
    RecipientAck(RecipientAckPayload),
    #[serde(rename = "restartTransfer")]
    RestartTransfer,
    #[serde(rename = "terminate")]
    Terminate,
    #[serde(other)]
    Unknown,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterPayload {
    pub conn_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecipientReadyPayload {
    pub sender_id: String,
    pub recipient_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileMetaPayload {
    pub sender_id: Option<String>,
    pub name: String,
    pub size: u64,
    pub mime_type: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelRecipientReadyPayload {
    pub sender_id: String,
    pub recipient_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelSenderReadyPayload {
    pub sender_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileChunkPayload {
    pub sender_id: Option<String>,
    pub file_name: String,
    pub total_size: u64,
    pub total_chunks: u16,
    pub uploaded_size: u64,
    pub chunk_index: u32,
    pub chunk_data_size: u32,
    pub sender_transfer_progress: u8,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileTransferAckPayload {
    pub recipient_id: Option<String>,
    pub sender_id: String,
    pub status: String,
    pub file_name: String,
    pub total_chunks: u16,
    pub uploaded_size: u64,
    pub chunk_index: u32,
    pub chunk_data_size: u32,
    pub recipient_transfer_progress: u8,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEndPayload {
    pub sender_id: Option<String>,
    pub file_name: String,
    pub total_size: u64,
    pub total_chunks: u16,
    pub uploaded_size: u64,
    pub last_chunk_index: u32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelSenderTransferPayload {
    pub sender_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelRecipientTransferPayload {
    pub sender_id: String,
    pub recipient_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SenderAckPayload {
    pub request_type: String,
    pub sender_id: Option<String>,
    pub recipient_id: String,
    pub status: String,
    pub message: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecipientAckPayload {
    pub recipient_id: Option<String>,
    pub sender_id: String,
    pub status: String,
    pub message: Option<String>,
}
