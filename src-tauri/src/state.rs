use anyhow::anyhow;
use btleplug::{
    api::Manager as _,
    platform::{Adapter, Manager},
};
use tauri::async_runtime::Mutex;

#[derive(Debug)]
pub struct BleState {
    pub adapter: Adapter,
}

impl BleState {
    pub async fn new() -> anyhow::Result<Self> {
        let manager = Manager::new().await?;
        let adapter = manager
            .adapters()
            .await?
            .into_iter()
            .next()
            .ok_or(anyhow!("No adapters found"))?;
        Ok(Self { adapter })
    }
}

pub type AppState = Mutex<BleState>;
