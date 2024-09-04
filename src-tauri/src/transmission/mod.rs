use anyhow::{bail, Result};
use btleplug::{
    api::{Characteristic, Peripheral as _, WriteType},
    platform::Peripheral,
};
use futures::StreamExt;
use meta_date::{ChunkMetaData, MetaData};
use msg::{NotifyMessage, ReadMessage};
use rand::random;
use serde::{Deserialize, Serialize};

use std::{fmt::Debug, marker::PhantomData};

pub mod meta_date;
pub mod msg;

pub trait DataFromBytes
where
    Self: Sized,
{
    fn from_data(value: &[u8]) -> (Self, &[u8]);
    fn bytes(&self) -> Vec<u8>;
}

#[derive(Debug, Clone)]
pub struct Transmission<T>
where
    T: Serialize + for<'a> Deserialize<'a> + Clone + Debug + 'static,
{
    peripheral: Peripheral,
    pub characteristic: Characteristic,
    _phantom: PhantomData<T>,
}

unsafe impl<T> Send for Transmission<T> where T: Serialize + for<'a> Deserialize<'a> + Clone + Debug {}
unsafe impl<T> Sync for Transmission<T> where T: Serialize + for<'a> Deserialize<'a> + Clone + Debug {}

impl<T> Transmission<T>
where
    T: Serialize + for<'a> Deserialize<'a> + Clone + Debug + 'static,
{
    pub fn new(peripheral: Peripheral, characteristic: Characteristic) -> Result<Self> {
        Ok(Self {
            peripheral,
            characteristic,
            _phantom: PhantomData,
        })
    }

    pub async fn read_value(&self) -> Result<T> {
        self.peripheral.subscribe(&self.characteristic).await?;
        self.peripheral
            .write(
                &self.characteristic,
                &ReadMessage::StartRead.bytes(),
                WriteType::WithResponse,
            )
            .await?;
        let mut notification = self.peripheral.notifications().await?;
        while let Some(msg) = notification.next().await {
            if msg.uuid == self.characteristic.uuid {
                let (notify_msg, _) = NotifyMessage::from_data(&msg.value);
                // tracing::info!("NotifyMessage: {:#?}", notify_msg);
                if let NotifyMessage::ReadReady(meta) = notify_msg {
                    let mut value: Vec<u8> = vec![];
                    loop {
                        let recv_data = self.peripheral.read(&self.characteristic).await?;
                        let (chunk_meta, data) = ChunkMetaData::from_data(&recv_data);
                        if chunk_meta.id == meta.id {
                            let next_start = chunk_meta.start + chunk_meta.chunk_size;
                            value.extend(data);
                            if next_start < meta.total_size {
                                self.peripheral
                                    .write(
                                        &self.characteristic,
                                        &ReadMessage::ReadReceive { next_start }.bytes(),
                                        WriteType::WithResponse,
                                    )
                                    .await?;
                            } else {
                                self.peripheral
                                    .write(
                                        &self.characteristic,
                                        &ReadMessage::ReadFinish.bytes(),
                                        WriteType::WithResponse,
                                    )
                                    .await?;

                                return Ok(serde_json::from_slice(&value)?);
                            }
                        } else {
                            bail!("chunk id not match");
                        }
                    }
                }
            }
        }
        bail!("read_value error: no data received");
    }

    pub async fn write_value(&self, value: &T) -> Result<()> {
        let id = random::<u32>();
        let data = serde_json::to_vec(value)?;
        let total_size = data.len();
        self.peripheral.subscribe(&self.characteristic).await?;
        let meta_data = MetaData {
            id,
            total_size: total_size as u32,
        };
        self.peripheral
            .write(
                &self.characteristic,
                &ReadMessage::StartWrite(meta_data).bytes(),
                WriteType::WithResponse,
            )
            .await?;

        let mut notification = self.peripheral.notifications().await?;
        let mut device_mtu = 0;
        while let Some(msg) = notification.next().await {
            // tracing::warn!("notification: {:#?}", msg);
            if msg.uuid == self.characteristic.uuid {
                let (notify_msg, _) = NotifyMessage::from_data(&msg.value);
                // tracing::info!("NotifyMessage: {:#?}", notify_msg);
                match notify_msg {
                    NotifyMessage::WriteReady { mtu } => {
                        device_mtu = mtu;
                        let chunk_size = (device_mtu as u32 - 12).min(total_size as u32);
                        let chunk_meta = ChunkMetaData {
                            id,
                            start: 0,
                            chunk_size,
                        };
                        let mut chunk_meta_bytes = ReadMessage::Write(chunk_meta).bytes();
                        chunk_meta_bytes.extend(&data[0..chunk_size as usize]);

                        self.peripheral
                            .write(
                                &self.characteristic,
                                &chunk_meta_bytes,
                                WriteType::WithResponse,
                            )
                            .await?;
                    }
                    NotifyMessage::WriteReceive { next_start } => {
                        let chunk_size =
                            (device_mtu as u32 - 12).min(total_size as u32 - next_start);

                        if next_start < total_size as u32 {
                            let chunk_meta = ChunkMetaData {
                                id,
                                start: next_start,
                                chunk_size,
                            };
                            let mut chunk_meta_bytes = ReadMessage::Write(chunk_meta).bytes();
                            chunk_meta_bytes.extend(
                                &data[next_start as usize..(next_start + chunk_size) as usize],
                            );
                            self.peripheral
                                .write(
                                    &self.characteristic,
                                    &chunk_meta_bytes,
                                    WriteType::WithResponse,
                                )
                                .await?;
                        }
                    }
                    NotifyMessage::WriteFinish => {
                        return Ok(());
                    }
                    _ => {}
                }
            }
        }
        bail!("write_value error: no notify received");
    }
}
