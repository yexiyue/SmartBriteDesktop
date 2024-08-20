mod ble;
mod error;
mod led;
mod state;
use ble::{
    connect, control, disconnect, get_devices, get_scene, get_state, init, set_scene, start_scan,
    stop_scan,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt().init();
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            init,
            start_scan,
            stop_scan,
            get_devices,
            connect,
            control,
            set_scene,
            get_scene,
            disconnect,
            get_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
