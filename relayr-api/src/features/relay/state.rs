use std::{collections::HashMap, sync::Arc};

use axum::extract::ws::Message;
use tokio::sync::{Mutex, mpsc::Sender};

use crate::features::relay::types::FileMetadata;

#[derive(Clone, Debug)]
pub struct RelayState {
    pub connections: Arc<Mutex<HashMap<String, Sender<Message>>>>,
    pub file_metadata: Arc<Mutex<HashMap<String, FileMetadata>>>,
    pub active_connections: Arc<Mutex<HashMap<String, String>>>,
}

impl RelayState {
    pub async fn add_peer_connection(&self, peer_id: &str, tx: Sender<Message>) {
        let mut connections = self.connections.lock().await;
        connections.insert(peer_id.to_owned(), tx);
    }

    pub async fn store_file_metadata(&self, sender_peer_id: &str, new_file_metadata: FileMetadata) {
        let mut file_metadata = self.file_metadata.lock().await;
        file_metadata.insert(sender_peer_id.to_owned(), new_file_metadata);
    }

    pub async fn clear_file_metadata(&self, sender_peer_id: &str) {
        let mut file_metadata = self.file_metadata.lock().await;
        let _ = file_metadata.remove(sender_peer_id).is_some();
    }

    pub async fn get_file_metadata(&self, sender_peer_id: &str) -> Option<FileMetadata> {
        let file_metadata = self.file_metadata.lock().await;
        file_metadata.get(sender_peer_id).cloned()
    }

    pub async fn get_peer_tx(&self, peer_id: &str) -> Option<Sender<Message>> {
        let connections = self.connections.lock().await;
        connections.get(peer_id).cloned()
    }

    pub async fn create_active_connection(&self, sender_peer_id: &str, recipient_peer_id: &str) {
        let mut active_connections = self.active_connections.lock().await;
        active_connections.insert(sender_peer_id.to_owned(), recipient_peer_id.to_owned());
    }

    pub async fn remove_active_connection(&self, sender_peer_id: &str) {
        let mut active_connections = self.active_connections.lock().await;
        let _ = active_connections.remove(sender_peer_id);
    }

    pub async fn is_sender_busy(&self, sender_peer_id: &str) -> bool {
        let active_connections = self.active_connections.lock().await;
        active_connections.contains_key(sender_peer_id)
    }

    pub async fn get_connected_recipient(&self, sender_peer_id: &str) -> Option<String> {
        let active_connections = self.active_connections.lock().await;
        active_connections.get(sender_peer_id).cloned()
    }

    pub async fn remove_peer_connection(&self, peer_id: &str) {
        let mut connections = self.connections.lock().await;
        let _ = connections.remove(peer_id);

        let mut active_connections = self.active_connections.lock().await;
        let _ = active_connections.remove(peer_id);
    }

    pub async fn get_connected_sender(&self, recipient_peer_id: &str) -> Option<String> {
        let active_connections = self.active_connections.lock().await;

        active_connections.iter().find_map(|(sender, recipient)| {
            if recipient == recipient_peer_id {
                Some(sender.clone())
            } else {
                None
            }
        })
    }
}

impl RelayState {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(Mutex::new(HashMap::new())),
            file_metadata: Arc::new(Mutex::new(HashMap::new())),
            active_connections: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl Default for RelayState {
    fn default() -> Self {
        Self::new()
    }
}
