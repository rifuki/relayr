mod error;
mod success;

pub use error::AppError;
pub use success::ApiResponse;

pub type AppResult<T> = Result<ApiResponse<T>, AppError>;
