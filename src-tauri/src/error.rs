#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    AnyError(#[from] anyhow::Error),
    #[error(transparent)]
    Btleplug(#[from] btleplug::Error),
    #[error(transparent)]
    Serde(#[from] serde_json::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub type Result<T> = std::result::Result<T, Error>;
