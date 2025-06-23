use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct RelayQueryParams {
    pub id: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct FileMetadata {
    pub name: String,
    pub size: u64,
    #[serde(rename = "type")]
    pub mime_type: String,
}

#[derive(PartialEq)]
pub enum DisconnectReason {
    TransferCompleted,
    Other,
}
