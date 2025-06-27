use std::sync::Arc;

use axum::extract::ws::WebSocket;
use futures::StreamExt;
use tokio::{
    sync::{Mutex, mpsc},
    time::Instant,
};

use crate::feature::relay::{
    state::RelayState,
    ws::{
        peer_disconnect, ping::spawn_ping_task, read::spawn_read_task,
        task_manager::wait_socket_tasks, write::spawn_write_task,
    },
};

pub async fn handle_socket(socket: WebSocket, state: RelayState, peer_id: String) {
    let (tx, rx) = mpsc::channel(100);
    state.add_peer_connection(&peer_id, tx.clone()).await;
    let (write, read) = socket.split();
    let last_heartbeat = Arc::new(Mutex::new(Instant::now()));

    let ping_task = spawn_ping_task(tx.clone(), last_heartbeat.clone());
    let read_task = spawn_read_task(
        read,
        tx,
        state.clone(),
        peer_id.clone(),
        last_heartbeat.clone(),
    );
    let write_task = spawn_write_task(write, rx);
    let disconnect_reason = wait_socket_tasks(ping_task, read_task, write_task).await;
    peer_disconnect::notify_peers_on_disconnect(&state, &peer_id, disconnect_reason).await;
    peer_disconnect::cleanup_peer_state(&state, &peer_id).await;
}
