use serde::{Deserialize, Serialize};
use std::env;
use std::time::Duration;
use pulldown_cmark::{Parser, Options, html};
use std::sync::OnceLock;

// Configuration constants
const DEFAULT_MODEL: &str = "mistral-small-2506";
const DEFAULT_MAX_TOKENS: u32 = 1000;
const DEFAULT_TEMPERATURE: f32 = 0.7;
const REQUEST_TIMEOUT_SECS: u64 = 30;

// Estimated token count: 754
const ROLE_PROMPT_FILE: &str = include_str!("role_prompt.txt");

// Global HTTP client for reuse
static HTTP_CLIENT: OnceLock<reqwest::Client> = OnceLock::new();

fn get_http_client() -> &'static reqwest::Client {
    HTTP_CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .timeout(Duration::from_secs(REQUEST_TIMEOUT_SECS))
            .build()
            .expect("Failed to create HTTP client")
    })
}

#[derive(Serialize, Deserialize)]
struct MistralMessage {
    role: String,
    content: String,
}

// Frontend message structure
#[derive(Serialize, Deserialize)]
struct FrontendMessage {
    id: u64,
    text: String,
    sender: String,
}

// Response structure with both formats
#[derive(Serialize, Deserialize)]
struct AiResponse {
    original: String,  // Original markdown from AI
    formatted: String, // HTML formatted version
}

#[derive(Serialize, Deserialize)]
struct MistralRequest {
    model: String,
    messages: Vec<MistralMessage>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
}

#[derive(Serialize, Deserialize)]
struct MistralChoice {
    message: MistralMessage,
}

#[derive(Serialize, Deserialize)]
struct MistralResponse {
    choices: Vec<MistralChoice>,
}

/// Converts markdown text to HTML with comprehensive formatting options
fn markdown_to_html(markdown: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_SMART_PUNCTUATION);
    
    let parser = Parser::new_ext(markdown, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    html_output
}

/// Validates input messages before sending to API
fn validate_messages(messages: &[FrontendMessage]) -> Result<(), String> {
    if messages.is_empty() {
        return Err("No messages provided".to_string());
    }
    
    for msg in messages {
        if msg.text.trim().is_empty() {
            return Err("Empty message content not allowed".to_string());
        }
    }
    
    Ok(())
}

/// Sends messages to Mistral AI API and returns formatted response
/// 
/// # Arguments
/// * `messages` - Vector of frontend messages to send to the AI
/// 
/// # Returns
/// * `Ok(AiResponse)` - Contains both original markdown and HTML formatted response
/// * `Err(String)` - Error message if validation fails or API call fails
#[tauri::command]
async fn send_message_to_mistral(messages: Vec<FrontendMessage>) -> Result<AiResponse, String> {
    // Validate input messages
    validate_messages(&messages)?;
    
    let api_key = env::var("MISTRAL_API_KEY")
        .map_err(|_| "Mistral API key not configured. Set MISTRAL_API_KEY environment variable.")?;
    
    // Get configuration from environment or use defaults
    let model = env::var("MISTRAL_MODEL").unwrap_or_else(|_| DEFAULT_MODEL.to_string());
    let max_tokens = env::var("MISTRAL_MAX_TOKENS")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(DEFAULT_MAX_TOKENS);
    let temperature = env::var("MISTRAL_TEMPERATURE")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(DEFAULT_TEMPERATURE);
    
    let client = get_http_client();
    
    // Start with system message containing the role prompt from file
    let mut mistral_messages = vec![MistralMessage {
        role: "system".to_string(),
        content: ROLE_PROMPT_FILE.trim().to_string(),
    }];
    
    // Add user and assistant messages from conversation history
    let conversation_messages: Vec<MistralMessage> = messages
        .iter()
        .map(|msg| MistralMessage {
            role: if msg.sender == "user" { "user".to_string() } else { "assistant".to_string() },
            content: msg.text.clone(),
        })
        .collect();
    
    mistral_messages.extend(conversation_messages);
    
    let request_body = MistralRequest {
        model,
        messages: mistral_messages,
        max_tokens: Some(max_tokens),
        temperature: Some(temperature),
    };

    let response = client
        .post("https://api.mistral.ai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                "Request timed out - please try again".to_string()
            } else if e.is_connect() {
                "Connection failed - check your internet connection".to_string()
            } else {
                format!("Network error: {}", e)
            }
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Mistral API error {}: {}", status, error_text));
    }

    let mistral_response: MistralResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    if let Some(choice) = mistral_response.choices.first() {
        let original_markdown = choice.message.content.clone();
        let formatted_html = markdown_to_html(&original_markdown);
        
        Ok(AiResponse {
            original: original_markdown,
            formatted: formatted_html,
        })
    } else {
        Err("No response from Mistral API".to_string())
    }
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_message_to_mistral])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
