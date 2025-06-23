#[macro_export]
macro_rules! send_or_stop {
    ($tx:expr, $msg:expr, $stop_flag:expr) => {
        if $tx.send($msg).await.is_err() {
            tracing::error!("send_or_stop! failed to send message; stopping read task.");
            $stop_flag.store(true, Ordering::Relaxed);
        }
    };
}

#[macro_export]
macro_rules! impl_ws_text_response {
    ($type:ty) => {
        impl fmt::Display for $type {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                match serde_json::to_string(self) {
                    Ok(res) => write!(f, "{res}"),
                    Err(e) => {
                        tracing::error!(?self, error = %e, "failed to serialize dto response");
                            write!(f, "{{\"success\": \"false\", \"message\": \"internal serialization error\"}}")
                    }
                }
            }
        }

        impl AsWsTextMessage for $type {
            fn as_ws_text_message(&self) -> Message {
                Message::text(self.to_string())
            }
        }
    };
}
