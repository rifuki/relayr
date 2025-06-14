use tokio::task::JoinHandle;

use super::receiver::DisconnectReason;

pub async fn wait_socket_tasks(
    mut ping_task: JoinHandle<()>,
    mut sender_task: JoinHandle<()>,
    mut receiver_task: JoinHandle<DisconnectReason>,
) -> DisconnectReason {
    tokio::select! {
        _ = &mut ping_task => {
            // tracing::info!("ping task finished");
            sender_task.abort();
            receiver_task.abort();
            DisconnectReason::Other
        }
        _ = &mut sender_task => {
            // tracing::info!("sender task finished");
            sender_task.abort();
            ping_task.abort();
            DisconnectReason::Other
        }
        res = &mut receiver_task => {
            // tracing::info!("receiver task finished");
            receiver_task.abort();
            ping_task.abort();
            res.unwrap_or(DisconnectReason::Other)

        }
    }
}
