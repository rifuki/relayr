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
    CancelSenderInProgress,
    CancelRecipientInProgress,
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
    pub file_name: String,
    pub file_size: u64,
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
    pub recipient_id: String,
}
