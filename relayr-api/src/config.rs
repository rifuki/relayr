use once_cell::sync::Lazy;

pub struct Config {
    pub rust_env: String,
    pub port: u16,
}

fn get_rust_env() -> String {
    if cfg!(debug_assertions) {
        "development".to_string()
    } else {
        "production".to_string()
    }
}

pub static CONFIG: Lazy<Config> = Lazy::new(|| {
    tracing::info!(".env file loaded, initializing configuration");
    Config {
        rust_env: get_rust_env(),
        port: std::env::var("PORT")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(8080),
    }
});
