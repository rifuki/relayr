//use super::error::ErrorMessage;
//
//pub fn parse_payload<T>(payload: &str) -> Result<T, ErrorMessage>
//where
//    T: serde::de::DeserializeOwned,
//{
//    serde_json::from_str(payload)
//        .map_err(|e| ErrorMessage::new("failed to message payload").with_details(&e.to_string()))
//}

//#[macro_export]
//macro_rules! parse_payload_or_return {
//    ($tx:expr, $text:expr, $ty:ty, $stop_flag:expr) => {
//        match $crate::relay::helpers::parse_payload::<$ty>($text) {
//            Ok(payload) => payload,
//            Err(e) => {
//                send_or_break!($tx, e.to_ws_msg(), $stop_flag);
//                return;
//            }
//        }
//    };
//}
