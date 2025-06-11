use std::time::Duration;

use axum::extract::ws::Message;
use tokio::{sync::mpsc::Sender, task::JoinHandle, time::interval};

pub fn spawn_ping_task(tx: Sender<Message>) -> JoinHandle<()> {
    tokio::spawn(async move {
        let mut interval = interval(Duration::from_secs(30));
        loop {
            interval.tick().await;
            if tx.send(Message::Ping(vec![].into())).await.is_err() {
                break;
            }
        }
    })
}
