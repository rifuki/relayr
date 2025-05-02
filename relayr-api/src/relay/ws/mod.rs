pub mod handlers;
pub mod receiver;
pub mod sender;
pub mod utils;

use axum::extract::ws::WebSocket;
use futures::StreamExt;
use receiver::spawn_receiver_task;
use sender::spawn_sender_task;
use tokio::sync::mpsc;
use utils::wait_socket_tasks;

use super::state::RelayState;

pub async fn handle_socket(socket: WebSocket, state: RelayState) {
    let base_conn_id = nanoid::nanoid!(7);
    let (tx, rx) = mpsc::channel(100);
    {
        state.add_base_connection(&base_conn_id, tx.clone()).await;
    }
    let (sender, receiver) = socket.split();

    let sender_task = spawn_sender_task(sender, rx);
    let receiver_task = spawn_receiver_task(receiver, tx, state.clone(), base_conn_id.clone());

    wait_socket_tasks(sender_task, receiver_task).await;

    state.clear_file_meta(&base_conn_id).await;
    state.remove_all_connections(&base_conn_id).await;
}
