use btleplug::api::{Central, CentralEvent, Peripheral, PeripheralProperties, ScanFilter};
use btleplug::platform::PeripheralId;
use futures::future::join_all;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::ipc::Channel;
use tauri::{Manager, State};
use tracing::info;
use uuid::uuid;

use crate::error::{Error, Result};
use crate::state::{AppState, BleState};

#[derive(Debug, Serialize, Deserialize)]
pub struct Device {
    pub id: PeripheralId,
    #[serde(flatten)]
    pub properties: PeripheralProperties,
}

#[tauri::command]
pub async fn init(app: tauri::AppHandle) -> Result<String> {
    let ble_state = BleState::new().await?;
    let info = ble_state.adapter.adapter_info().await?;
    let state = AppState::new(ble_state);
    app.manage(state);
    Ok(info)
}

#[tauri::command]
pub async fn start_scan(state: State<'_, AppState>, channel: Channel<Value>) -> Result<()> {
    let ble_state = state.lock().await;
    let adapter = ble_state.adapter.clone();
    let mut events = adapter.events().await?;
    adapter
        .start_scan(ScanFilter {
            services: vec![uuid!("e572775c-0df9-4b44-926b-b692e31d6971")],
        })
        .await?;

    tauri::async_runtime::spawn(async move {
        while let Some(event) = events.next().await {
            if matches!(event, CentralEvent::DeviceDiscovered(_)) {
                let peripherals = adapter.peripherals().await?;
                let properties_futures = peripherals
                    .into_iter()
                    .map(|item| async move { (item.properties().await, item.id()) });

                let properties = join_all(properties_futures).await;
                let data = properties
                    .into_iter()
                    .filter_map(|(properties_result, id)| {
                        if let Ok(Some(properties)) = properties_result {
                            Some(Device { id, properties })
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<_>>();
                channel.send(serde_json::to_value(data)?)?;
            }
        }
        Ok::<(), Error>(())
    });
    Ok(())
}

#[tauri::command]
pub async fn stop_scan(state: State<'_, AppState>) -> Result<()> {
    let ble_state = state.lock().await;
    ble_state.adapter.stop_scan().await?;
    Ok(())
}

#[tauri::command]
pub async fn get_devices(state: State<'_, AppState>) -> Result<Vec<Device>> {
    let ble_state = state.lock().await;
    let peripherals = ble_state.adapter.peripherals().await?;
    let properties_futures = peripherals
        .into_iter()
        .map(|item| async move { (item.properties().await, item.id()) });

    let properties = join_all(properties_futures).await;
    let data = properties
        .into_iter()
        .filter_map(|(properties_result, id)| {
            if let Ok(Some(properties)) = properties_result {
                Some(Device { id, properties })
            } else {
                None
            }
        })
        .collect();
    Ok(data)
}

#[tauri::command]
pub async fn connect_device(state: State<'_, AppState>, id: PeripheralId) -> Result<()> {
    #[cfg(dev)]
    info!("connect_device id: {id}");

    let ble_state = state.lock().await;
    let peripheral = ble_state.adapter.peripheral(&id).await?;
    peripheral.connect().await?;
    peripheral.discover_services().await?;
    Ok(())
}
