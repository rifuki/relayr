use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
use std::time::{Duration, Instant};
use tokio::sync::Mutex;
use tokio::task::JoinHandle;

type SharedInstant = Arc<Mutex<Instant>>;

/// Task heartbeat monitor: jika tidak ada pong dalam timeout, set stop_flag agar koneksi ditutup.
pub fn spawn_heartbeat_monitor(last_pong: SharedInstant, stop_flag: Arc<AtomicBool>, timeout: Duration) -> JoinHandle<()> {
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(10)).await; // interval cek
            let last = last_pong.lock().await;
            if last.elapsed() > timeout {
                stop_flag.store(true, Ordering::Relaxed);
                break;
            }
        }
    })
} 