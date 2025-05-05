use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};

use axum::extract::ws::Message;
use tokio::sync::mpsc::Sender;

use crate::{
    relay::{
        dto::{
            requests::RelayIncomingPayload,
            responses::{
                Ack, CancelRecipientReadyResponseDto, CancelSenderReadyResponseDto, FileChunk,
                FileEnd, RecipientReadyResponseDto, RegisterResponseDto, WsResponse,
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
                .store_file_meta(
                    &sender_id,
                    &payload.file_name,
                    payload.file_size,
                    &payload.mime_type,
                )
                .await;
            //let connected_recipient = state.get_connected_recipient(&sender_id).await;
            //if let Some(recipient_id) = connected_recipient {
            //    if let Some(recipient_tx) = state.get_user_tx(&recipient_id).await {
            //        let success_msg = FileMetaResponseDto::new(
            //            &payload.file_name,
            //            payload.file_size,
            //            &payload.mime_type,
            //        )
            //        .to_ws_msg();
            //        send_or_break!(recipient_tx, success_msg, stop_flag);
            //    } else {
            //        let err_msg = ErrorMessage::new(&format!(
            //            "Recipient `{}` is no longer connected.",
            //            recipient_id
            //        ))
            //        .to_ws_msg();
            //        send_or_break!(tx, err_msg, stop_flag);
            //    }
            //} else {
            //    let err_msg = ErrorMessage::new(&format!(
            //        "Active connection for sender_id `{}` not found.",
            //        sender_id
            //    ))
            //    .to_ws_msg();
            //    send_or_break!(tx, err_msg, stop_flag);
            //}
        }
        RelayIncomingPayload::RecipientReady(payload) => {
            let connected_recipient = state.get_connected_recipient(&payload.sender_id).await;

            if let Some(current_recipient) = connected_recipient {
                let err_msg = ErrorMessage::new(&format!(
                    "Sender is already connected to recipient: `{current_recipient}`"
                ))
                .to_ws_msg();
                send_or_break!(tx, err_msg, stop_flag);
            } else {
                let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
                if let Some(sender_tx) = state.get_user_tx(&payload.sender_id).await {
                    state
                        .create_active_connection(&payload.sender_id, &recipient_id)
                        .await;
                    let success_msg = RecipientReadyResponseDto::new(&recipient_id).to_ws_msg();
                    send_or_break!(sender_tx, success_msg, stop_flag);
                } else {
                    let err_msg = ErrorMessage::new(&format!(
                        "Sender `{}` is no longer connected. Please ask the sender to generate new link.",
                        &payload.sender_id
                    ))
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
                            CancelRecipientReadyResponseDto::new(&recipient_id).to_ws_msg();
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
                    let success_msg = CancelSenderReadyResponseDto::new(&sender_id).to_ws_msg();
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
                    let success_msg = FileChunk::new(
                        &sender_id,
                        &payload.file_name,
                        payload.total_chunks,
                        payload.total_size,
                        payload.chunk_index,
                        payload.uploaded_size,
                        payload.chunk_data_size,
                        payload.transfer_progress,
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
        RelayIncomingPayload::Ack(payload) => {
            let recipient_id = payload.recipient_id.unwrap_or(base_conn_id.to_owned());
            if let Some(sender_tx) = state.get_user_tx(&payload.sender_id).await {
                let success_msg = Ack::new(
                    &recipient_id,
                    &payload.status,
                    &payload.file_name,
                    payload.total_chunks,
                    payload.chunk_index,
                    payload.uploaded_size,
                )
                .chunk_data_size(payload.chunk_data_size)
                .transfer_progress(payload.transfer_progress)
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
                    let success_msg = FileEnd::new(
                        &payload.file_name,
                        payload.total_chunks,
                        payload.total_size,
                        payload.chunk_index,
                        payload.uploaded_size,
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
