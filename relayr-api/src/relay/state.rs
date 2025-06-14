use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};

use axum::extract::ws::Message;
use serde::Serialize;
use tokio::sync::{Mutex, mpsc::Sender};

#[derive(Debug, Clone, Serialize)]
pub struct FileMeta {
    name: String,
    size: u64,
    #[serde(rename = "type")]
    mime_type: String,
}

#[derive(Clone, Debug)]
pub struct RelayState {
    pub connections: Arc<Mutex<HashMap<String, Sender<Message>>>>,
    pub id_mappings: Arc<Mutex<HashMap<String, HashSet<String>>>>,
    pub file_meta: Arc<Mutex<HashMap<String, FileMeta>>>,
    pub active_connections: Arc<Mutex<HashMap<String, String>>>,
}

impl RelayState {
    pub async fn add_base_connection(&self, conn_id: &str, tx: Sender<Message>) {
        let mut connections = self.connections.lock().await;
        connections.insert(conn_id.to_owned(), tx);

        let mut id_mappings = self.id_mappings.lock().await;
        id_mappings
            .entry(conn_id.to_owned())
            .or_insert_with(HashSet::new);

        tracing::info!(conn_id, "base connection added");
    }

    pub async fn add_custom_connection(
        &self,
        base_conn_id: &str,
        custom_conn_id: &str,
        tx: Sender<Message>,
    ) -> String {
        let mut connections = self.connections.lock().await;
        connections.insert(custom_conn_id.to_owned(), tx);

        let mut id_mappings = self.id_mappings.lock().await;
        id_mappings
            .entry(base_conn_id.to_owned())
            .or_insert_with(HashSet::new)
            .insert(custom_conn_id.to_owned());

        tracing::info!(base_conn_id, custom_conn_id, "custom connection added");

        custom_conn_id.to_owned()
    }

    pub async fn store_file_meta(&self, sender_id: &str, name: &str, size: u64, mime_type: &str) {
        let mut file_metas = self.file_meta.lock().await;
        let file_meta = FileMeta {
            name: name.to_owned(),
            size,
            mime_type: mime_type.to_owned(),
        };
        file_metas.insert(sender_id.to_owned(), file_meta);
        // tracing::info!(sender_id, name, size, mime_type, "Stored file metadata");
    }

    pub async fn clear_file_meta(&self, sender_id: &str) {
        let mut file_metas = self.file_meta.lock().await;
        if file_metas.remove(sender_id).is_some() {
            // tracing::info!(sender_id, "Cleared file metadata");
        }
    }

    pub async fn get_file_meta(&self, sender_id: &str) -> Option<FileMeta> {
        let file_metas = self.file_meta.lock().await;
        file_metas.get(sender_id).cloned()
    }

    pub async fn get_user_tx(&self, user_id: &str) -> Option<Sender<Message>> {
        let connections = self.connections.lock().await;
        connections.get(user_id).cloned()
    }

    pub async fn create_active_connection(&self, sender_id: &str, recipient_id: &str) {
        let mut active_connections = self.active_connections.lock().await;
        active_connections.insert(sender_id.to_owned(), recipient_id.to_owned());
        tracing::info!(sender_id, recipient_id, "active connection started");
    }

    pub async fn remove_active_connection(&self, sender_id: &str) {
        let mut active_connections = self.active_connections.lock().await;
        let removed = active_connections.remove(sender_id);
        match removed {
            Some(recipient_id) => {
                tracing::info!(sender_id, recipient_id, "active connection removed");
            }
            None => {
                tracing::warn!(sender_id, "no active connection to remove");
            }
        }
    }

    pub async fn is_sender_busy(&self, sender_id: &str) -> bool {
        let active_connections = self.active_connections.lock().await;
        active_connections.contains_key(sender_id)
    }

    pub async fn get_connected_recipient(&self, sender_id: &str) -> Option<String> {
        let active_connections = self.active_connections.lock().await;
        active_connections.get(sender_id).cloned()
    }

    pub async fn remove_all_connections(&self, base_conn_id: &str) {
        let custom_ids = {
            let mut id_mappings = self.id_mappings.lock().await;
            id_mappings.remove(base_conn_id).unwrap_or_default()
        };

        let mut connections = self.connections.lock().await;

        if connections.remove(base_conn_id).is_some() {
            tracing::info!(base_conn_id, "remove base connection");
        }

        let mut active_connections = self.active_connections.lock().await;
        if active_connections.remove(base_conn_id).is_some() {
            tracing::info!(base_conn_id, "remove active connection");
        }

        for custom_id in custom_ids {
            connections.remove(&custom_id);
            tracing::info!(custom_id, "remove custom connection");
        }
    }

    pub async fn get_connected_sender(&self, recipient_id: &str) -> Option<String> {
        let active_connections = self.active_connections.lock().await;

        active_connections.iter().find_map(|(sender, recipient)| {
            if recipient == recipient_id {
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
            id_mappings: Arc::new(Mutex::new(HashMap::new())),
            file_meta: Arc::new(Mutex::new(HashMap::new())),
            active_connections: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl Default for RelayState {
    fn default() -> Self {
        Self::new()
    }
}
