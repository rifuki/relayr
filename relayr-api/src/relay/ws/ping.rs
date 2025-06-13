use std::{sync::Arc, time::Duration};

use axum::extract::ws::Message;
use tokio::{
    sync::{Mutex, mpsc::Sender},
    task::JoinHandle,
    time::{Instant, interval},
};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(30);

pub fn spawn_ping_task(tx: Sender<Message>, last_heartbeat: Arc<Mutex<Instant>>) -> JoinHandle<()> {
    tokio::spawn(async move {
        let mut interval = interval(HEARTBEAT_INTERVAL);

        loop {
            interval.tick().await;

            let last_heartbeat = last_heartbeat.lock().await;

            if last_heartbeat.elapsed() > CLIENT_TIMEOUT {
                break;
            } else if last_heartbeat.elapsed() > CLIENT_TIMEOUT / 2 {
                tracing::warn!("No pong received for more than half of timeout period")
            }

            if tx.send(Message::Ping(vec![].into())).await.is_err() {
                break;
            }
        }
    })
}
