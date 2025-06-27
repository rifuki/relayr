use std::net::SocketAddr;

#[allow(unused)]
use tracing_subscriber::layer::SubscriberExt;
#[allow(unused)]
use tracing_subscriber::util::SubscriberInitExt;

use dotenv::dotenv;
use tower_http::cors::{Any, CorsLayer};

use relayr_api::{config::CONFIG, routes::app_routes};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    #[cfg(feature = "console")]
    {
        let fmt_layer = tracing_subscriber::fmt::layer().with_target(true);

        tracing_subscriber::registry()
            .with(console_subscriber::spawn())
            .with(fmt_layer)
            .with(tracing_subscriber::EnvFilter::new("trace"))
            .init();

        println!("Tokio Console mode activated - connect console client on 127.0.0.1:6669");
    }

    #[cfg(not(feature = "console"))]
    {
        tracing_subscriber::fmt().with_env_filter("info").init();
    }

    let addr = SocketAddr::from(([0, 0, 0, 0], CONFIG.port));
    let tcp_listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("listening on https://{}", addr);

    let cors = CorsLayer::new().allow_origin(Any);

    let app = app_routes().layer(cors);

    axum::serve(tcp_listener, app).await
}
