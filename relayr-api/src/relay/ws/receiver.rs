use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};

use axum::extract::ws::{Message, WebSocket};
use futures::{StreamExt, stream::SplitStream};
use tokio::{sync::mpsc::Sender, task::JoinHandle};

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

pub fn spawn_receiver_task(
    mut receiver: SplitStream<WebSocket>,
    tx: Sender<Message>,
    state: RelayState,
    base_conn_id: String,
) -> JoinHandle<()> {
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
                Message::Close(reason) => {
                    if let Some(reason) = &reason {
                        tracing::info!(
                            code = reason.code,
                            reason = %reason.reason,
                            "websocket closed"
                        );
                    } else {
                        tracing::info!("WebSocket closed with no close frame (e.g., code 1006)");
                    }

                    let close_msg = Message::Close(reason);
                    send_or_break!(tx, close_msg, stop_flag);
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
    })
}
