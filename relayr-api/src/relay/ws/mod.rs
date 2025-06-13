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

use super::{
    dto::responses::{PeerDisconnectedResponseDto, WsResponse},
    state::RelayState,
};

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

    if let Some(recipient_id) = state.get_connected_recipient(&id).await {
        if let Some(recipient_tx) = state.get_user_tx(&recipient_id).await {
            let msg = PeerDisconnectedResponseDto::new(&id, "sender").to_ws_msg();
            let _ = recipient_tx.send(msg).await;
        }
    }

    if let Some(sender_id) = state.get_connected_sender(&id).await {
        if let Some(sender_tx) = state.get_user_tx(&sender_id).await {
            let msg = PeerDisconnectedResponseDto::new(&id, "recipient").to_ws_msg();
            let _ = sender_tx.send(msg).await;
        }
    }

    state.clear_file_meta(&id).await;
    state.remove_all_connections(&id).await;
}
