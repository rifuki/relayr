use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};

use axum::extract::ws::{Message, WebSocket};
use futures::{StreamExt, stream::SplitStream};
use tokio::{
    sync::{Mutex, mpsc::Sender},
    task::JoinHandle,
    time::Instant,
};

use crate::{
    relay::{
        dto::{
            requests::RelayIncomingPayload,
            responses::{RegisterResponseDto, WsResponse},
        },
        error::ErrorMessage,
        state::RelayState,
        ws::handlers::handle_incoming_payload,
    },
    send_or_break,
};

#[derive(PartialEq)]
pub enum DisconnectReason {
    TransferCompleted,
    Other,
}

pub fn spawn_receiver_task(
    mut receiver: SplitStream<WebSocket>,
    tx: Sender<Message>,
    state: RelayState,
    base_conn_id: String,
    last_heartbeat: Arc<Mutex<Instant>>,
) -> JoinHandle<DisconnectReason> {
    tokio::spawn(async move {
        let stop_flag = Arc::new(AtomicBool::new(false));

        let send_initial_registration_response =
            RegisterResponseDto::new(&base_conn_id).to_ws_msg();
        send_or_break!(tx, send_initial_registration_response, stop_flag);

        while let Some(Ok(msg_stream)) = receiver.next().await {
            match msg_stream {
                Message::Text(text) => {
                    let incoming_payload = serde_json::from_str::<RelayIncomingPayload>(&text);
                    match incoming_payload {
                        Ok(payload) => {
                            handle_incoming_payload(
                                payload,
                                &tx,
                                &state,
                                &base_conn_id,
                                stop_flag.clone(),
                            )
                            .await
                        }
                        Err(e) => {
                            let err_msg = ErrorMessage::new("failed to parse payload")
                                .with_details(&e.to_string())
                                .to_ws_msg();
                            send_or_break!(tx, err_msg, stop_flag);
                        }
                    }
                }
                Message::Binary(bin_data) => {
                    if let Some(current_recipient) =
                        state.get_connected_recipient(&base_conn_id).await
                    {
                        if let Some(recipient_tx) = state.get_user_tx(&current_recipient).await {
                            send_or_break!(recipient_tx, Message::binary(bin_data), stop_flag);
                        } else {
                            let err_msg = ErrorMessage::new(&format!(
                                "Recipient `{}` is no longer connected",
                                current_recipient
                            ))
                            .to_ws_msg();
                            send_or_break!(tx, err_msg, stop_flag);
                        }
                    } else {
                        tracing::warn!(
                            "Sender `{}` attempted to send a file, but no recipient is connected",
                            base_conn_id
                        );
                        let err_msg = ErrorMessage::new(
                            "Active connection not found. The receiver may have disconnected",
                        )
                        .to_ws_msg();

                        send_or_break!(tx, err_msg, stop_flag);
                    }
                }
                Message::Pong(_) => {
                    let mut last_heartbeat = last_heartbeat.lock().await;
                    *last_heartbeat = Instant::now();
                }
                Message::Close(reason) => {
                    if let Some(reason) = &reason {
                        tracing::info!(
                            code = reason.code,
                            reason = %reason.reason,
                        );
                        if reason.reason.to_lowercase().contains("transfer completed") {
                            return DisconnectReason::TransferCompleted;
                        } else {
                            return DisconnectReason::Other;
                        }
                    } else {
                        tracing::info!("WebSocket closed with no close frame (e.g., code 1006)");
                    }
                    break;
                }
                _ => {
                    let err_msg = ErrorMessage::new("unsupported ws message type").to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            }

            if stop_flag.load(Ordering::Relaxed) {
                break;
            }
        }
        DisconnectReason::Other
    })
}
