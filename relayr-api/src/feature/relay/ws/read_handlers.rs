use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};

use axum::extract::ws::{CloseFrame, Message};
use tokio::sync::mpsc::Sender;

use crate::{
    feature::relay::{
        error::{ErrorCode, ErrorMessage},
        state::RelayState,
        types::FileMetadata,
        ws::dto::{
            request::RelayIncomingPayload,
            response::{
                AsWsTextMessage, CancelRecipientReadyResponseDto,
                CancelRecipientTransferResponseDto, CancelSenderReadyResponseDto,
                CancelSenderTransferResponseDto, FileChunkResponseDto, FileEndResponseDto,
                FileTransferAckResponseDto, RecipientReadyResponseDto, RestartTransferResponseDto,
                SenderAckResponseDto,
            },
        },
    },
    send_or_stop,
};

pub async fn handle_text_message_payload(
    message: RelayIncomingPayload,
    tx: &Sender<Message>,
    state: &RelayState,
    base_conn_id: &str,
    stop_flag: Arc<AtomicBool>,
) {
    match message {
        RelayIncomingPayload::FileMetadata(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());

            let new_file_metadata = FileMetadata {
                name: payload.name.clone(),
                size: payload.size,
                mime_type: payload.mime_type.clone(),
            };

            state
                .store_file_metadata(&sender_id, new_file_metadata)
                .await;
        }
        RelayIncomingPayload::RecipientReady(payload) => {
            let connected_recipient = state.get_connected_recipient(&payload.sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                let err_msg = ErrorMessage::new(
                    ErrorCode::SenderAlreadyConnected,
                    &format!(
                        "sender `{}` is already connected to recipient `{}`",
                        &payload.sender_id, current_recipient
                    ),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            } else {
                let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
                if let Some(sender_tx) = state.get_peer_tx(&payload.sender_id).await {
                    state
                        .create_active_connection(&payload.sender_id, &recipient_id)
                        .await;
                    let success_msg =
                        RecipientReadyResponseDto::new(&recipient_id, &payload.sender_id)
                            .as_ws_text_message();
                    send_or_stop!(sender_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::SenderDisconnected,
                        &format!("sender `{}` is no longer connected", &payload.sender_id),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            }
        }
        RelayIncomingPayload::CancelRecipientReady(payload) => {
            let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&payload.sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if current_recipient == recipient_id {
                    if let Some(sender_tx) = state.get_peer_tx(&payload.sender_id).await {
                        state.remove_active_connection(&payload.sender_id).await;
                        let success_msg =
                            CancelRecipientReadyResponseDto::new(&recipient_id, &payload.sender_id)
                                .as_ws_text_message();
                        send_or_stop!(sender_tx, success_msg, stop_flag);
                    } else {
                        let err_msg = ErrorMessage::new(
                            ErrorCode::SenderDisconnected,
                            &format!("sender `{}` is no longer connected", &payload.sender_id),
                        )
                        .as_ws_text_message();
                        send_or_stop!(tx, err_msg, stop_flag);
                    }
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::RecipientMismatch,
                        &format!(
                            "recipient ID mismatch. expected `{}`, got `{}`",
                            current_recipient, recipient_id
                        ),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::ActiveConnectionNotFound,
                    &format!(
                        "active connection for sender_id: `{}` not found",
                        &payload.sender_id
                    ),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::CancelSenderReady(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                state.remove_active_connection(&sender_id).await;
                if let Some(recipient_tx) = state.get_peer_tx(&current_recipient).await {
                    let success_msg =
                        CancelSenderReadyResponseDto::new(&sender_id, &current_recipient)
                            .as_ws_text_message();
                    send_or_stop!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::RecipientDisconnected,
                        &format!(
                            "recipient with id `{}` has no active connection",
                            current_recipient
                        ),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::ActiveConnectionNotFound,
                    &format!("active connection for sender_id: `{}` not found", sender_id),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::FileChunk(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_peer_tx(&current_recipient).await {
                    let success_msg = FileChunkResponseDto::new(
                        &sender_id,
                        &current_recipient,
                        &payload.file_name,
                        payload.total_size,
                        payload.total_chunks,
                        payload.uploaded_size,
                        payload.chunk_index,
                        payload.chunk_data_size,
                        payload.sender_transfer_progress,
                    )
                    .as_ws_text_message();
                    send_or_stop!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::RecipientDisconnected,
                        &format!("recipient `{}` is no longer connected", current_recipient),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::ActiveConnectionNotFound,
                    &format!("active connection for sender_id: `{}` not found", sender_id),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::FileTransferAck(payload) => {
            let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
            if let Some(sender_tx) = state.get_peer_tx(&payload.sender_id).await {
                let success_msg = FileTransferAckResponseDto::new(
                    &recipient_id,
                    &payload.sender_id,
                    &payload.status,
                    &payload.file_name,
                    payload.total_chunks,
                    payload.uploaded_size,
                    payload.chunk_index,
                    payload.chunk_data_size,
                    payload.recipient_transfer_progress,
                )
                .as_ws_text_message();
                send_or_stop!(sender_tx, success_msg, stop_flag);
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::SenderDisconnected,
                    &format!("sender `{}` is no longer connected", &payload.sender_id),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::FileEnd(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_peer_tx(&current_recipient).await {
                    let success_msg = FileEndResponseDto::new(
                        &sender_id,
                        &current_recipient,
                        &payload.file_name,
                        payload.total_size,
                        payload.total_chunks,
                        payload.uploaded_size,
                        payload.last_chunk_index,
                    )
                    .as_ws_text_message();
                    send_or_stop!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::RecipientDisconnected,
                        &format!("recipient `{}` is no longer connected", current_recipient),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::ActiveConnectionNotFound,
                    &format!("active connection for sender_id: `{}` not found", sender_id),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::CancelSenderTransfer(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_peer_tx(&current_recipient).await {
                    let success_msg =
                        CancelSenderTransferResponseDto::new(&sender_id, &current_recipient)
                            .as_ws_text_message();
                    send_or_stop!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::RecipientDisconnected,
                        &format!("recipient `{}` is no longer connected", current_recipient),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::ActiveConnectionNotFound,
                    &format!("active connection for sender_id: `{}` not found", sender_id),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::CancelRecipientTransfer(payload) => {
            let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&payload.sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if current_recipient == recipient_id {
                    if let Some(sender_tx) = state.get_peer_tx(&payload.sender_id).await {
                        let success_msg = CancelRecipientTransferResponseDto::new(
                            &recipient_id,
                            &payload.sender_id,
                        )
                        .as_ws_text_message();
                        send_or_stop!(sender_tx, success_msg, stop_flag);
                    } else {
                        let err_msg = ErrorMessage::new(
                            ErrorCode::SenderDisconnected,
                            &format!("sender `{}` is no longer connected", &payload.sender_id),
                        )
                        .as_ws_text_message();
                        send_or_stop!(tx, err_msg, stop_flag);
                    }
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::RecipientMismatch,
                        &format!(
                            "recipient ID mismatch. Expected `{}`, `{}`",
                            current_recipient, recipient_id
                        ),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::ActiveConnectionNotFound,
                    &format!(
                        "active connection for sender_id: `{}` not found",
                        &payload.sender_id
                    ),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::SenderAck(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());

            if let Some(recipient_tx) = state.get_peer_tx(&payload.recipient_id).await {
                let success_msg = SenderAckResponseDto::new(
                    &payload.request_type,
                    &sender_id,
                    &payload.recipient_id,
                    payload.message,
                )
                .as_ws_text_message();
                send_or_stop!(recipient_tx, success_msg, stop_flag);
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::RecipientDisconnected,
                    &format!(
                        "recipient `{}` is no longer connected",
                        &payload.recipient_id
                    ),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::RestartTransfer => {
            let sender_id = base_conn_id.to_owned();
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_peer_tx(&current_recipient).await {
                    let response_message =
                        RestartTransferResponseDto::new(&sender_id, &current_recipient)
                            .as_ws_text_message();
                    send_or_stop!(recipient_tx, response_message, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(
                        ErrorCode::RecipientDisconnected,
                        &format!("recipient `{}` is no longer connected", current_recipient),
                    )
                    .as_ws_text_message();
                    send_or_stop!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(
                    ErrorCode::ActiveConnectionNotFound,
                    &format!("active connection for sender_id: `{}` not found", sender_id),
                )
                .as_ws_text_message();
                send_or_stop!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::UserClose(payload) => {
            let user_id = payload.user_id.unwrap_or(base_conn_id.to_owned());
            let role = payload.role;
            let reason = payload
                .reason
                .unwrap_or("Closed with no reason.".to_owned());

            let mut close_reason = format!("User `{}` with role `{}`. {}", user_id, role, reason);

            while close_reason.len() > 123 {
                close_reason.pop();
            }

            let close_msg = Message::Close(Some(CloseFrame {
                code: 1000,
                reason: close_reason.into(),
            }));

            send_or_stop!(tx, close_msg, stop_flag);
        }
        RelayIncomingPayload::Terminate => stop_flag.store(true, Ordering::Relaxed),
        RelayIncomingPayload::Unknown => {
            let err_msg = ErrorMessage::new(
                ErrorCode::UnsupportedWsMessageTextType,
                "unknown json message type",
            )
            .as_ws_text_message();

            send_or_stop!(tx, err_msg, stop_flag);
        }
    }
}
