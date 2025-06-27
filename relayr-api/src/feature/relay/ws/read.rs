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
    feature::relay::{
        error::{ErrorCode, ErrorMessage},
        state::RelayState,
        types::DisconnectReason,
        ws::dto::{
            request::RelayIncomingPayload,
            response::{AsWsTextMessage, RegisterResponseDto},
        },
        ws::read_handlers::handle_text_message_payload,
    },
    send_or_stop,
};

pub fn spawn_read_task(
    mut read: SplitStream<WebSocket>,
    tx: Sender<Message>,
    state: RelayState,
    peer_id: String,
    last_heartbeat: Arc<Mutex<Instant>>,
) -> JoinHandle<DisconnectReason> {
    tokio::spawn(async move {
        let stop_flag = Arc::new(AtomicBool::new(false));

        send_or_stop!(
            tx,
            RegisterResponseDto::new(&peer_id).as_ws_text_message(),
            stop_flag
        );

        while let Some(Ok(msg_stream)) = read.next().await {
            match msg_stream {
                Message::Text(text) => {
                    let incoming_payload = serde_json::from_str::<RelayIncomingPayload>(&text);
                    match incoming_payload {
                        Ok(payload) => {
                            handle_text_message_payload(
                                payload,
                                &tx,
                                &state,
                                &peer_id,
                                stop_flag.clone(),
                            )
                            .await
                        }
                        Err(e) => {
                            let err_msg = ErrorMessage::new(
                                ErrorCode::InvalidPayload,
                                "failed to parse payload",
                            )
                            .with_details(&e.to_string())
                            .as_ws_text_message();
                            send_or_stop!(tx, err_msg, stop_flag);
                        }
                    }
                }
                Message::Binary(bin_data) => {
                    if let Some(current_recipient) = state.get_connected_recipient(&peer_id).await {
                        if let Some(recipient_tx) = state.get_peer_tx(&current_recipient).await {
                            send_or_stop!(recipient_tx, Message::binary(bin_data), stop_flag);
                        } else {
                            let err_msg = ErrorMessage::new(
                                ErrorCode::RecipientDisconnected,
                                &format!(
                                    "recipient `{}` is no longer connected",
                                    current_recipient
                                ),
                            )
                            .as_ws_text_message();
                            send_or_stop!(tx, err_msg, stop_flag);
                        }
                    } else {
                        tracing::warn!(
                            "sender `{}` attempted to send a file, but no recipient is connected",
                            peer_id
                        );
                        let err_msg = ErrorMessage::new(
                            ErrorCode::ActiveConnectionNotFound,
                            "active connection for sender_id: `{}` not found",
                        )
                        .as_ws_text_message();

                        send_or_stop!(tx, err_msg, stop_flag);
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
                        }
                    } else {
                        tracing::info!("WebSocket closed with no close frame (e.g., code 1006)");
                    }
                    break;
                }
                _ => {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::UnsupportedWsMessageType,
                        "unsupported websocket message type",
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            }

            if stop_flag.load(Ordering::Relaxed) {
                break;
            }
        }
        DisconnectReason::Other
    })
}
