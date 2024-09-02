use anyhow::anyhow;
use btleplug::api::{Central, CentralEvent, Peripheral, PeripheralProperties, ScanFilter};
use btleplug::platform::PeripheralId;
use futures::future::join_all;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::ipc::Channel;
use tauri::{AppHandle, Emitter, Manager, State};
use tracing::info;
use uuid::uuid;

use crate::error::{Error, Result};
use crate::led::Led;
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
            // uuid!("e572775c-0df9-4b44-926b-b692e31d6971")
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
pub async fn connect(
    app: AppHandle,
    state: State<'_, AppState>,
    id: PeripheralId,
) -> Result<Device> {
    #[cfg(dev)]
    info!("connect_device id: {id}");

    let mut ble_state = state.lock().await;
    let device = if let Some(led) = ble_state.leds.get(&id) {
        led.peripheral.connect().await?;
        let device = Device {
            id: id.clone(),
            properties: led
                .peripheral
                .properties()
                .await?
                .ok_or(anyhow!("Device not found"))?,
        };
        let led_clone = led.clone();
        tauri::async_runtime::spawn(async move {
            let mut notifications = led_clone.peripheral.notifications().await?;
            while let Some(notification) = notifications.next().await {
                if notification.uuid == led_clone.scene_characteristic.uuid {
                    let value: Value = serde_json::from_slice(&notification.value)?;
                    #[cfg(dev)]
                    info!("notification: {value}");
                    app.emit(&format!("scene-{}", led_clone.peripheral.id()), value)?;
                } else if notification.uuid == led_clone.state_characteristic.uuid {
                    let str = String::from_utf8(notification.value)?;
                    #[cfg(dev)]
                    info!("notification: {str}");
                    app.emit(&format!("state-{}", led_clone.peripheral.id()), str)?;
                } else if notification.uuid == led_clone.time_task_characteristic.uuid {
                    let value: Value = serde_json::from_slice(&notification.value)?;
                    #[cfg(dev)]
                    info!("notification: {value}");
                    app.emit(&format!("time-tasks-{}", led_clone.peripheral.id()), value)?;
                }
            }
            Ok::<(), anyhow::Error>(())
        });
        device
    } else {
        let peripheral = ble_state.adapter.peripheral(&id).await?;
        let device = Device {
            id: id.clone(),
            properties: peripheral
                .properties()
                .await?
                .ok_or(anyhow!("Device not found"))?,
        };
        let led = Led::new(peripheral).await?;
        led.check_connected().await?;
        led.set_time().await?;
        let led_clone = led.clone();

        tauri::async_runtime::spawn(async move {
            let mut notifications = led_clone.peripheral.notifications().await?;
            while let Some(notification) = notifications.next().await {
                if notification.uuid == led_clone.scene_characteristic.uuid {
                    let value: Value = serde_json::from_slice(&notification.value)?;
                    #[cfg(dev)]
                    info!("notification: {value}");
                    app.emit(&format!("scene-{}", led_clone.peripheral.id()), value)?;
                } else if notification.uuid == led_clone.state_characteristic.uuid {
                    let str = String::from_utf8(notification.value)?;
                    #[cfg(dev)]
                    info!("notification: {str}");
                    app.emit(&format!("state-{}", led_clone.peripheral.id()), str)?;
                } else if notification.uuid == led_clone.time_task_characteristic.uuid {
                    let value: Value = serde_json::from_slice(&notification.value)?;
                    #[cfg(dev)]
                    info!("notification: {value}");
                    app.emit(&format!("time-tasks-{}", led_clone.peripheral.id()), value)?;
                }
            }
            Ok::<(), anyhow::Error>(())
        });
        led.on_state().await?;

        ble_state.leds.insert(id, led);
        device
    };

    Ok(device)
}

#[tauri::command]
pub async fn control(state: State<'_, AppState>, id: PeripheralId, command: &str) -> Result<()> {
    #[cfg(dev)]
    info!("control id: {id}");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    led.control(command.into()).await?;
    Ok(())
}

#[tauri::command]
pub async fn set_scene(state: State<'_, AppState>, id: PeripheralId, scene: Value) -> Result<()> {
    #[cfg(dev)]
    info!("set_scene id: {id} value: {scene:#?}");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    led.set_scene(scene).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_scene(state: State<'_, AppState>, id: PeripheralId) -> Result<Value> {
    #[cfg(dev)]
    info!("get_scene id: {id}");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    let scene = led.get_scene().await?;
    Ok(scene)
}

#[tauri::command]
pub async fn get_time_tasks(state: State<'_, AppState>, id: PeripheralId) -> Result<Value> {
    #[cfg(dev)]
    info!("get_scene id: {id}");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    let scene = led.get_time_tasks().await?;
    Ok(scene)
}

#[tauri::command]
pub async fn get_state(state: State<'_, AppState>, id: PeripheralId) -> Result<String> {
    #[cfg(dev)]
    info!("get_scene id: {id}");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    let state = led.get_state().await?;
    Ok(state)
}

#[tauri::command]
pub async fn disconnect(state: State<'_, AppState>, id: PeripheralId) -> Result<()> {
    #[cfg(dev)]
    info!("disconnect id: {id}");
    let mut ble_state = state.lock().await;
    let led = ble_state.leds.remove(&id).ok_or(anyhow!("Led not found"))?;
    led.peripheral.disconnect().await?;
    Ok(())
}

#[tauri::command]
pub async fn set_timer(
    state: State<'_, AppState>,
    id: PeripheralId,
    timer_event: Value,
) -> Result<()> {
    #[cfg(dev)]
    info!("set_timer id: {id} value: {timer_event:#?}");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    led.set_timer(timer_event).await?;
    Ok(())
}

#[tauri::command]
pub async fn write_value(state: State<'_, AppState>, id: PeripheralId, value: Value) -> Result<()> {
    #[cfg(dev)]
    info!("write_value id: {id} value: {value:#?}");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    led.transmission.write_value(&value).await?;

    Ok(())
}

#[tauri::command]
pub async fn read_value(state: State<'_, AppState>, id: PeripheralId) -> Result<Value> {
    #[cfg(dev)]
    info!("read_value id: {id} ");
    let ble_state = state.lock().await;
    let led = ble_state.leds.get(&id).ok_or(anyhow!("Led not found"))?;
    Ok(led.transmission.read_value().await?)
}
