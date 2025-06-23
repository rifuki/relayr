use tokio::task::JoinHandle;

use crate::features::relay::types::DisconnectReason;

pub async fn wait_socket_tasks(
    mut ping_task: JoinHandle<()>,
    mut read_task: JoinHandle<DisconnectReason>,
    mut write_task: JoinHandle<()>,
) -> DisconnectReason {
    tokio::select! {
        _ = &mut ping_task => {
            write_task.abort();
            read_task.abort();
            DisconnectReason::Other
        }
        res = &mut read_task => {
            ping_task.abort();
            write_task.abort();
            res.unwrap_or(DisconnectReason::Other)

        }
        _ = &mut write_task => {
            read_task.abort();
            ping_task.abort();
            DisconnectReason::Other
        }
    }
}
