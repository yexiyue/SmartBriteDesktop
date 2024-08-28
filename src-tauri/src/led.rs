use anyhow::{anyhow, bail, Result};
use btleplug::{
    api::{Characteristic, Peripheral as _, WriteType},
    platform::Peripheral,
};
use serde_json::Value;
use tracing::info;
use uuid::uuid;

#[derive(Debug, Clone)]
pub enum LedCommand {
    Open,
    Close,
    Reset,
}

impl From<&str> for LedCommand {
    fn from(value: &str) -> Self {
        match value {
            "open" => LedCommand::Open,
            "close" => LedCommand::Close,
            "reset" => LedCommand::Reset,
            _ => panic!("invalid control"),
        }
    }
}
impl Into<&[u8]> for LedCommand {
    fn into(self) -> &'static [u8] {
        match self {
            LedCommand::Open => b"open",
            LedCommand::Close => b"close",
            LedCommand::Reset => b"reset",
        }
    }
}

#[derive(Debug, Clone)]
pub struct Led {
    pub peripheral: Peripheral,
    pub scene_characteristic: Characteristic,
    pub control_characteristic: Characteristic,
    pub state_characteristic: Characteristic,
    pub time_characteristic: Characteristic,
    pub time_task_characteristic: Characteristic,
}

impl Led {
    pub async fn new(peripheral: Peripheral) -> Result<Self> {
        peripheral.connect().await?;
        peripheral.discover_services().await?;

        let services = peripheral.services();
        let mut scene_characteristic = None;
        let mut control_characteristic = None;
        let mut state_characteristic = None;
        let mut time_characteristic = None;
        let mut time_task_characteristic = None;

        if let Some(characteristics) = services
            .into_iter()
            .find(|item| item.uuid == uuid!("e572775c-0df9-4b44-926b-b692e31d6971"))
            .map(|service| service.characteristics)
        {
            for item in characteristics {
                if item.uuid == uuid!("c7d7ee2f-c84b-4f5c-a2a4-e642c97a880d") {
                    scene_characteristic = Some(item);
                } else if item.uuid == uuid!("bc00dad8-280c-49f9-9efd-3a8137594ef2") {
                    control_characteristic = Some(item);
                } else if item.uuid == uuid!("e192efae-9626-4767-8a27-b96cb9753e10") {
                    state_characteristic = Some(item);
                } else if item.uuid == uuid!("9ae95835-6543-4bd0-8aec-6c48fe9fd989") {
                    time_characteristic = Some(item);
                } else if item.uuid == uuid!("f144af69-9642-97e1-d712-9448d1b450a1") {
                    time_task_characteristic = Some(item);
                }
            }
        }

        Ok(Self {
            peripheral,
            scene_characteristic: scene_characteristic
                .ok_or(anyhow!("scene characteristic not found"))?,
            control_characteristic: control_characteristic
                .ok_or(anyhow!("control characteristic not found"))?,
            state_characteristic: state_characteristic
                .ok_or(anyhow!("state characteristic not found"))?,
            time_characteristic: time_characteristic
                .ok_or(anyhow!("time characteristic not found"))?,
            time_task_characteristic: time_task_characteristic
                .ok_or(anyhow!("time task characteristic not found"))?,
        })
    }
    pub async fn control(&self, command: LedCommand) -> Result<()> {
        self.check_connected().await?;
        Ok(self
            .peripheral
            .write(
                &self.control_characteristic,
                command.into(),
                WriteType::WithResponse,
            )
            .await?)
    }

    pub async fn set_time(&self) -> Result<()> {
        let time = chrono::Utc::now().timestamp();
        info!("set time {time}");
        self.check_connected().await?;
        Ok(self
            .peripheral
            .write(
                &self.time_characteristic,
                &chrono::Utc::now().timestamp_millis().to_ne_bytes(),
                WriteType::WithResponse,
            )
            .await?)
    }

    pub async fn set_scene(&self, scene: Value) -> Result<()> {
        self.check_connected().await?;
        Ok(self
            .peripheral
            .write(
                &self.scene_characteristic,
                scene.to_string().as_bytes(),
                WriteType::WithResponse,
            )
            .await?)
    }

    pub async fn get_scene(&self) -> Result<Value> {
        self.check_connected().await?;
        let state = self.peripheral.read(&self.scene_characteristic).await?;
        Ok(serde_json::from_slice(&state)?)
    }

    pub async fn get_time_tasks(&self) -> Result<Value> {
        self.check_connected().await?;
        let state = self.peripheral.read(&self.time_task_characteristic).await?;
        Ok(serde_json::from_slice(&state)?)
    }

    pub async fn get_state(&self) -> Result<String> {
        self.check_connected().await?;
        let state = self.peripheral.read(&self.state_characteristic).await?;
        Ok(String::from_utf8(state)?)
    }

    pub async fn on_state(&self) -> Result<()> {
        self.check_connected().await?;
        self.peripheral
            .subscribe(&self.state_characteristic)
            .await?;
        self.peripheral
            .subscribe(&self.scene_characteristic)
            .await?;
        self.peripheral
            .subscribe(&self.time_task_characteristic)
            .await?;
        Ok(())
    }

    pub async fn check_connected(&self) -> Result<()> {
        if !self.peripheral.is_connected().await? {
            bail!("led device not connected")
        }
        Ok(())
    }

    pub async fn set_timer(&self, scene: Value) -> Result<()> {
        self.check_connected().await?;
        Ok(self
            .peripheral
            .write(
                &self.time_task_characteristic,
                scene.to_string().as_bytes(),
                WriteType::WithResponse,
            )
            .await?)
    }
}
