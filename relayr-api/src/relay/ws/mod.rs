mod handlers;
mod ping;
mod receiver;
mod sender;
mod utils;

use std::sync::Arc;

use axum::extract::ws::WebSocket;
use futures::StreamExt;
use ping::spawn_ping_task;
use receiver::spawn_receiver_task;
use sender::spawn_sender_task;
use tokio::{
    sync::{Mutex, mpsc},
    time::Instant,
};
use utils::wait_socket_tasks;

use super::state::RelayState;

pub async fn handle_socket(socket: WebSocket, state: RelayState, id: String) {
    let (tx, rx) = mpsc::channel(100);
    {
        state.add_base_connection(&id, tx.clone()).await;
    }
    let (sender, receiver) = socket.split();
    let last_heartbeat = Arc::new(Mutex::new(Instant::now()));

    let ping_task = spawn_ping_task(tx.clone(), last_heartbeat.clone());
    let sender_task = spawn_sender_task(sender, rx);
    let receiver_task = spawn_receiver_task(
        receiver,
        tx,
        state.clone(),
        id.clone(),
        last_heartbeat.clone(),
    );

    wait_socket_tasks(ping_task, sender_task, receiver_task).await;

    state.clear_file_meta(&id).await;
    state.remove_all_connections(&id).await;
}
