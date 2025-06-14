use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};

use axum::extract::ws::{CloseFrame, Message};
use tokio::sync::mpsc::Sender;

use crate::{
    relay::{
        dto::{
            requests::RelayIncomingPayload,
            responses::{
                CancelRecipientReadyResponseDto, CancelRecipientTransferResponseDto,
                CancelSenderReadyResponseDto, CancelSenderTransferResponseDto,
                FileChunkResponseDto, FileEndResponseDto, FileTransferAckResponseDto,
                RecipientReadyResponseDto, RegisterResponseDto, RestartTransferResponseDto,
                SenderAckResponseDto, WsResponse,
            },
        },
        error::ErrorMessage,
        state::RelayState,
    },
    send_or_break,
};

pub async fn handle_incoming_payload(
    message: RelayIncomingPayload,
    tx: &Sender<Message>,
    state: &RelayState,
    base_conn_id: &str,
    stop_flag: Arc<AtomicBool>,
) {
    match message {
        RelayIncomingPayload::Register(payload) => {
            let conn_id = state
                .add_custom_connection(base_conn_id, &payload.conn_id, tx.clone())
                .await;

            let res = RegisterResponseDto::new(&conn_id).to_ws_msg();
            send_or_break!(tx, res, stop_flag);
        }
        RelayIncomingPayload::FileMeta(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());

            state
                .store_file_meta(&sender_id, &payload.name, payload.size, &payload.mime_type)
                .await;
        }
        RelayIncomingPayload::RecipientReady(payload) => {
            let connected_recipient = state.get_connected_recipient(&payload.sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                tracing::info!(
                    "Sender is already connected to another recipient: `{current_recipient}`"
                );
                let err_msg =
                    ErrorMessage::new("Sender is already connected to another recipient.")
                        .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            } else {
                let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
                if let Some(sender_tx) = state.get_user_tx(&payload.sender_id).await {
                    state
                        .create_active_connection(&payload.sender_id, &recipient_id)
                        .await;
                    let success_msg =
                        RecipientReadyResponseDto::new(&recipient_id, &payload.sender_id)
                            .to_ws_msg();
                    send_or_break!(sender_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(
                        "Sender is no longer connected. Please ask the sender to generate new link."
                    )
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            }
        }
        RelayIncomingPayload::CancelRecipientReady(payload) => {
            let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&payload.sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if current_recipient == recipient_id {
                    if let Some(sender_tx) = state.get_user_tx(&payload.sender_id).await {
                        state.remove_active_connection(&payload.sender_id).await;
                        let success_msg =
                            CancelRecipientReadyResponseDto::new(&recipient_id, &payload.sender_id)
                                .to_ws_msg();
                        send_or_break!(sender_tx, success_msg, stop_flag);
                    } else {
                        let err_msg = ErrorMessage::new(&format!(
                            "Sender `{}` is no longer connected",
                            &payload.sender_id
                        ))
                        .to_ws_msg();
                        send_or_break!(tx, err_msg, stop_flag);
                    }
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Recipient ID mismatch. Expected `{}`, `{}`",
                        current_recipient, recipient_id
                    ))
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Active connection for sender_id: `{}` not found",
                    &payload.sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::CancelSenderReady(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                state.remove_active_connection(&sender_id).await;
                if let Some(recipient_tx) = state.get_user_tx(&current_recipient).await {
                    let success_msg =
                        CancelSenderReadyResponseDto::new(&sender_id, &current_recipient)
                            .to_ws_msg();
                    send_or_break!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Recipient with id `{}` has no active connection",
                        current_recipient
                    ))
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Active connection for sender_id: `{}` not found",
                    sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::FileChunk(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_user_tx(&current_recipient).await {
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
                    .to_ws_msg();
                    send_or_break!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Recipient `{}` is no longer connected",
                        current_recipient
                    ))
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Active connection for sender_id: `{}` not found",
                    sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::FileTransferAck(payload) => {
            let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
            if let Some(sender_tx) = state.get_user_tx(&payload.sender_id).await {
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
                .to_ws_msg();
                send_or_break!(sender_tx, success_msg, stop_flag);
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Sender `{}` is no longer connected",
                    &payload.sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::FileEnd(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_user_tx(&current_recipient).await {
                    let success_msg = FileEndResponseDto::new(
                        &sender_id,
                        &current_recipient,
                        &payload.file_name,
                        payload.total_size,
                        payload.total_chunks,
                        payload.uploaded_size,
                        payload.last_chunk_index,
                    )
                    .to_ws_msg();
                    send_or_break!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Recipient `{}` is no longer connected",
                        current_recipient
                    ))
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Active connection for sender_id: `{}` not found",
                    sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::CancelSenderTransfer(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_user_tx(&current_recipient).await {
                    let success_msg =
                        CancelSenderTransferResponseDto::new(&sender_id, &current_recipient)
                            .to_ws_msg();
                    send_or_break!(recipient_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Recipient `{}` is no longer connected",
                        current_recipient
                    ))
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Active connection for sender_id: `{}` not found",
                    sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::CancelRecipientTransfer(payload) => {
            let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
            let connected_recipient = state.get_connected_recipient(&payload.sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if current_recipient == recipient_id {
                    if let Some(sender_tx) = state.get_user_tx(&payload.sender_id).await {
                        let success_msg = CancelRecipientTransferResponseDto::new(
                            &recipient_id,
                            &payload.sender_id,
                        )
                        .to_ws_msg();
                        send_or_break!(sender_tx, success_msg, stop_flag);
                    } else {
                        let err_msg = ErrorMessage::new(&format!(
                            "Sender `{}` is no longer connected",
                            &payload.sender_id
                        ))
                        .to_ws_msg();
                        send_or_break!(tx, err_msg, stop_flag);
                    }
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Recipient ID mismatch. Expected `{}`, `{}`",
                        current_recipient, recipient_id
                    ))
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Active connection for sender_id: `{}` not found",
                    &payload.sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::SenderAck(payload) => {
            let sender_id = payload.sender_id.unwrap_or(base_conn_id.to_owned());

            if let Some(recipient_tx) = state.get_user_tx(&payload.recipient_id).await {
                let success_msg = SenderAckResponseDto::new(
                    &payload.request_type,
                    &sender_id,
                    &payload.recipient_id,
                )
                .to_ws_msg();
                send_or_break!(recipient_tx, success_msg, stop_flag);
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Recipient `{}` is no longer connected",
                    &payload.recipient_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        //RelayIncomingPayload::RecipientAck(payload) => {
        //    let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
        //}
        RelayIncomingPayload::RestartTransfer => {
            let sender_id = base_conn_id.to_owned();
            let connected_recipient = state.get_connected_recipient(&sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                if let Some(recipient_tx) = state.get_user_tx(&current_recipient).await {
                    let response_message =
                        RestartTransferResponseDto::new(&sender_id, &current_recipient).to_ws_msg();
                    send_or_break!(recipient_tx, response_message, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Recipient `{}` is no longer connected",
                        current_recipient
                    ))
                    .to_ws_msg();
                    send_or_break!(tx, err_msg, stop_flag);
                }
            } else {
                let err_msg = ErrorMessage::new(&format!(
                    "Active connection for sender_id: `{}` not found",
                    sender_id
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            }
        }
        RelayIncomingPayload::UserClose(payload) => {
            let reason = format!(
                "User `{}` with role `{}`. {}",
                payload.user_id,
                payload.role,
                payload
                    .reason
                    .as_deref()
                    .unwrap_or("Closed with no reason.")
            );

            let close_msg = Message::Close(Some(CloseFrame {
                code: 1000,
                reason: reason.into(),
            }));

            send_or_break!(tx, close_msg, stop_flag);
        }
        RelayIncomingPayload::Terminate => stop_flag.store(true, Ordering::Relaxed),
        RelayIncomingPayload::Unknown => {
            let err_msg = ErrorMessage::new("unknown message type").to_ws_msg();

            send_or_break!(tx, err_msg, stop_flag);
        }
        _ => {
            let err_msg = ErrorMessage::new("not handled yet!").to_ws_msg();
            send_or_break!(tx, err_msg, stop_flag);
        }
    }
}
