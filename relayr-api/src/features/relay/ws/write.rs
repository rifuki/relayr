use axum::extract::ws::{Message, WebSocket};
use futures::{SinkExt, stream::SplitSink};
use tokio::{sync::mpsc::Receiver, task::JoinHandle};

pub fn spawn_write_task(
    mut write: SplitSink<WebSocket, Message>,
    mut rx: Receiver<Message>,
) -> JoinHandle<()> {
    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if write.send(msg).await.is_err() {
                break;
            }
        }
    })
}
