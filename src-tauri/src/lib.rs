use serde::{Deserialize, Serialize};
use std::env;
use pulldown_cmark::{Parser, Options, html};

#[derive(Serialize, Deserialize)]
struct MistralMessage {
    role: String,
    content: String,
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

#[tauri::command]
async fn send_message_to_mistral(message: String) -> Result<String, String> {
    let api_key = env::var("MISTRAL_API_KEY")
        .unwrap_or_else(|_| "MISSING".to_string());
    
    if api_key == "MISSING" {
        return Err("Mistral API key not configured. Set MISTRAL_API_KEY environment variable.".to_string());
    }

    let client = reqwest::Client::new();
    
    let request_body = MistralRequest {
        model: "open-mistral-nemo-2407".to_string(),
        messages: vec![
            MistralMessage {
                role: "user".to_string(),
                content: message,
            }
        ],
        max_tokens: Some(1000),
        temperature: Some(0.7),
    };

    let response = client
        .post("https://api.mistral.ai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

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
        // Convert markdown to HTML before returning
        let html_content = markdown_to_html(&choice.message.content);
        Ok(html_content)
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
