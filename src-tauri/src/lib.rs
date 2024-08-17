mod ble;
mod error;
mod led;
mod state;
use ble::{connect_device, control, get_devices, init, set_scene, start_scan, stop_scan};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt().init();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            init,
            start_scan,
            stop_scan,
            get_devices,
            connect_device,
            control,
            set_scene
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
