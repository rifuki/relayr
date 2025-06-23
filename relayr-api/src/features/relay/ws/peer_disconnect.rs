use crate::features::relay::{
    dto::responses::{AsWsTextMessage, PeerDisconnectedResponseDto},
    state::RelayState,
    types::DisconnectReason,
};

pub async fn notify_peers_on_disconnect(
    state: &RelayState,
    peer_id: &str,
    reason: DisconnectReason,
) {
    if reason != DisconnectReason::TransferCompleted {
        if let Some(recipient_peer_id) = state.get_connected_recipient(peer_id).await {
            if let Some(recipient_tx) = state.get_peer_tx(&recipient_peer_id).await {
                let msg = PeerDisconnectedResponseDto::new(peer_id, "sender").as_ws_text_message();
                let _ = recipient_tx.send(msg).await;
            }
        }

        if let Some(sender_peer_id) = state.get_connected_sender(peer_id).await {
            if let Some(sender_tx) = state.get_peer_tx(&sender_peer_id).await {
                state.remove_active_connection(&sender_peer_id).await;

                let msg =
                    PeerDisconnectedResponseDto::new(peer_id, "recipient").as_ws_text_message();
                let _ = sender_tx.send(msg).await;
            }
        }
    }
}

pub async fn cleanup_peer_state(state: &RelayState, peer_id: &str) {
    state.clear_file_metadata(peer_id).await;
    state.remove_peer_connection(peer_id).await;
}
