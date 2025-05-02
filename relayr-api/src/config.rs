use once_cell::sync::Lazy;
use std::env;

pub struct Config {
    pub app_env: String,
    pub port: u16,
}

pub static CONFIG: Lazy<Config> = Lazy::new(|| {
    tracing::info!("CONFIG INIT");
    Config {
        app_env: env::var("APP_ENV").unwrap_or("production".to_string()),
        port: std::env::var("PORT")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(9001),
    }
});
