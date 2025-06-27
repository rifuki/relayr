use axum::{
    body::Body,
    http::{HeaderMap, HeaderName, HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
};
use chrono::Utc;
use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    success: bool,
    code: u16,
    data: Option<T>,
    message: String,
    timestamp: i64,

    #[serde(skip)]
    headers: HeaderMap,
}

impl<T: Serialize> Default for ApiResponse<T> {
    fn default() -> Self {
        ApiResponse {
            success: true,
            code: 200,
            data: None,
            message: "Success".to_string(),
            timestamp: Utc::now().timestamp(),

            headers: HeaderMap::new(),
        }
    }
}

impl<T: Serialize> ApiResponse<T> {
    pub fn with_code(mut self, code: StatusCode) -> Self {
        self.code = code.as_u16();
        self
    }

    pub fn with_data(mut self, data: T) -> Self {
        self.data = Some(data);
        self
    }

    pub fn with_message(mut self, message: &str) -> Self {
        self.message = message.to_owned();
        self
    }

    pub fn with_header(mut self, key: HeaderName, value: &str) -> Self {
        let value =
            HeaderValue::from_str(value).expect("Provided value is not a valid ASCII string");
        self.headers.insert(key, value);
        self
    }
}

impl<T: Serialize> IntoResponse for ApiResponse<T> {
    fn into_response(self) -> Response {
        let status_code =
            StatusCode::from_u16(self.code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);

        let body = serde_json::to_string(&self)
            .expect("Failed to serialize ApiResponse. This should never happen.");

        let mut builder = Response::builder().status(status_code);

        for (key, value) in self.headers {
            if let Some(k) = key {
                builder = builder.header(k, value);
            }
        }

        builder
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(body))
            .expect("Failed to build response. This should never happen.")
    }
}
