#[macro_export]
macro_rules! send_or_break {
    ($tx:expr, $msg:expr, $stop_flag:expr) => {
        if $tx.send($msg).await.is_err() {
            tracing::error!("send_or_break! failed to send message; stopping loop.");
            $stop_flag.store(true, Ordering::Relaxed);
        }
    };
}

#[macro_export]
macro_rules! impl_response_dto {
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

        impl WsResponse for $type {
            fn to_ws_msg(&self) -> Message {
                Message::text(self.to_string())
            }
        }
    };
}
