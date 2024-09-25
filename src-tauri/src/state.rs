use std::collections::HashMap;

use anyhow::anyhow;
use btleplug::{
    api::Manager as _,
    platform::{Adapter, Manager, PeripheralId},
};
use tauri::async_runtime::Mutex;

use crate::led::Led;

#[derive(Debug)]
pub struct BleState {
    pub adapter: Adapter,
    pub leds: HashMap<PeripheralId, Led>,
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

        Ok(Self {
            adapter,
            leds: HashMap::new(),
        })
    }
}

pub type AppState = Mutex<BleState>;
