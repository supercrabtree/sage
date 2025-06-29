mod ai;
mod config;

use serde::{Deserialize, Serialize};
use ai::AiService;
use config::AppConfig;
use std::sync::Arc;

// Models stay in lib.rs since they're simple
#[derive(Serialize, Deserialize)]
pub struct MistralMessage {
    pub role: String,
    pub content: String,
}

#[derive(Serialize, Deserialize)]
pub struct FrontendMessage {
    pub id: u64,
    pub text: String,
    pub sender: String,
}

#[derive(Serialize, Deserialize)]
pub struct AiResponse {
    pub original: String,
    pub formatted: String,
}

// App state
struct AppState {
    ai_service: Arc<AiService>,
}

impl AppState {
    fn new() -> Result<Self, String> {
        let config = AppConfig::from_env()?;
        let ai_service = Arc::new(AiService::new(config));
        Ok(Self { ai_service })
    }
}

// Tauri commands
#[tauri::command]
async fn send_message_to_mistral(
    messages: Vec<FrontendMessage>,
    state: tauri::State<'_, AppState>,
) -> Result<AiResponse, String> {
    state.ai_service.send_messages(messages).await
}

#[tauri::command]
async fn extract_options_from_message(
    message: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    state.ai_service.extract_options(message).await
}

#[tauri::command]
async fn knowledge_discovery(
    conversation_context: String,
    user_input: String,
    state: tauri::State<'_, AppState>,
) -> Result<AiResponse, String> {
    state.ai_service.knowledge_discovery(conversation_context, user_input).await
}

#[tauri::command]
async fn extract_knowledge_from_conversation(
    conversation: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    state.ai_service.extract_knowledge(conversation).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new().expect("Failed to initialize app state");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            send_message_to_mistral,
            extract_options_from_message,
            knowledge_discovery,
            extract_knowledge_from_conversation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
