use tokio::task::JoinHandle;

pub async fn wait_socket_tasks(mut sender_task: JoinHandle<()>, mut receiver_task: JoinHandle<()>) {
    tokio::select! {
        _ = &mut sender_task => {
            tracing::info!("sender task finished");
            sender_task.abort();
        }
        _ = &mut receiver_task => {
            tracing::info!("receiver task finished");
            receiver_task.abort();
        }
    }
}
