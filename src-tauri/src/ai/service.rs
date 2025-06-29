use crate::{config::AppConfig, FrontendMessage, MistralMessage, AiResponse};
use serde::{Deserialize, Serialize};
use pulldown_cmark::{Parser, Options, html};
use std::sync::OnceLock;
use std::time::Duration;

const ROLE_PROMPT: &str = include_str!("role_prompt.txt");
const OPTION_EXTRACTION_PROMPT: &str = include_str!("option_extraction_prompt.txt");
const KNOWLEDGE_DISCOVERY_PROMPT: &str = include_str!("knowledge_discovery_prompt.txt");
const KNOWLEDGE_EXTRACTION_PROMPT: &str = include_str!("knowledge_extraction_prompt.txt");

static HTTP_CLIENT: OnceLock<reqwest::Client> = OnceLock::new();

fn get_client() -> &'static reqwest::Client {
    HTTP_CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client")
    })
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

#[derive(Serialize, Deserialize)]
struct MistralRequest {
    model: String,
    messages: Vec<MistralMessage>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
}

#[derive(Serialize, Deserialize)]
struct MistralResponse {
    choices: Vec<MistralChoice>,
}

#[derive(Serialize, Deserialize)]
struct MistralChoice {
    message: MistralMessage,
}

pub struct AiService {
    config: AppConfig,
}

impl AiService {
    pub fn new(config: AppConfig) -> Self {
        Self { config }
    }
    
    pub async fn send_messages(&self, messages: Vec<FrontendMessage>) -> Result<AiResponse, String> {
        if messages.is_empty() {
            return Err("No messages provided".to_string());
        }
        
        let mut mistral_messages = vec![MistralMessage {
            role: "system".to_string(),
            content: ROLE_PROMPT.trim().to_string(),
        }];
        
        for msg in messages {
            mistral_messages.push(MistralMessage {
                role: if msg.sender == "user" { "user".to_string() } else { "assistant".to_string() },
                content: msg.text,
            });
        }
        
        let request = MistralRequest {
            model: self.config.model.clone(),
            messages: mistral_messages,
            max_tokens: Some(self.config.max_tokens),
            temperature: Some(self.config.temperature),
        };

        let response = get_client()
            .post("https://api.mistral.ai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.config.mistral_api_key))
            .header("Content-Type", "application/json")
            .json(&request)
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
            let original = choice.message.content.clone();
            let formatted = markdown_to_html(&original);
            Ok(AiResponse { original, formatted })
        } else {
            Err("No response from Mistral API".to_string())
        }
    }
    
    pub async fn extract_options(&self, message: String) -> Result<String, String> {
        let extraction_prompt = OPTION_EXTRACTION_PROMPT.replace("{}", &message);
        
        let request = MistralRequest {
            model: self.config.option_model.clone(),
            messages: vec![MistralMessage {
                role: "user".to_string(),
                content: extraction_prompt,
            }],
            max_tokens: Some(200),
            temperature: Some(0.1),
        };

        let response = get_client()
            .post("https://api.mistral.ai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.config.mistral_api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    "Option extraction timed out - please try again".to_string()
                } else if e.is_connect() {
                    "Connection failed - check your internet connection".to_string()
                } else {
                    format!("Network error during option extraction: {}", e)
                }
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("Mistral API error during option extraction {}: {}", status, error_text));
        }

        let mistral_response: MistralResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse option extraction response: {}", e))?;

        mistral_response.choices.first()
            .map(|choice| choice.message.content.clone())
            .ok_or_else(|| "No response from Mistral API for option extraction".to_string())
    }

    pub async fn extract_knowledge(&self, conversation: String) -> Result<String, String> {
        let extraction_prompt = KNOWLEDGE_EXTRACTION_PROMPT.replace("{}", &conversation);
        
        let request = MistralRequest {
            model: self.config.option_model.clone(), // Use same fast model as option extraction
            messages: vec![MistralMessage {
                role: "user".to_string(),
                content: extraction_prompt,
            }],
            max_tokens: Some(500), // More tokens for potentially multiple tags
            temperature: Some(0.1), // Low temperature for structured output
        };

        let response = get_client()
            .post("https://api.mistral.ai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.config.mistral_api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    "Knowledge extraction timed out - please try again".to_string()
                } else if e.is_connect() {
                    "Connection failed - check your internet connection".to_string()
                } else {
                    format!("Network error during knowledge extraction: {}", e)
                }
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("Mistral API error during knowledge extraction {}: {}", status, error_text));
        }

        let mistral_response: MistralResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse knowledge extraction response: {}", e))?;

        mistral_response.choices.first()
            .map(|choice| choice.message.content.clone())
            .ok_or_else(|| "No response from Mistral API for knowledge extraction".to_string())
    }

    pub async fn knowledge_discovery(&self, conversation_context: String, user_input: String) -> Result<AiResponse, String> {
        let discovery_prompt = format!(
            "{}\n\nPrevious conversation:\n{}\n\nUser just said: {}\n\nRespond conversationally:",
            KNOWLEDGE_DISCOVERY_PROMPT,
            conversation_context,
            user_input
        );
        
        let request = MistralRequest {
            model: self.config.model.clone(),
            messages: vec![MistralMessage {
                role: "user".to_string(),
                content: discovery_prompt,
            }],
            max_tokens: Some(self.config.max_tokens),
            temperature: Some(0.7), // Slightly higher temperature for more conversational responses
        };

        let response = get_client()
            .post("https://api.mistral.ai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.config.mistral_api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    "Knowledge discovery timed out - please try again".to_string()
                } else if e.is_connect() {
                    "Connection failed - check your internet connection".to_string()
                } else {
                    format!("Network error during knowledge discovery: {}", e)
                }
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("Mistral API error during knowledge discovery {}: {}", status, error_text));
        }

        let mistral_response: MistralResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse knowledge discovery response: {}", e))?;

        if let Some(choice) = mistral_response.choices.first() {
            let original = choice.message.content.clone();
            let formatted = markdown_to_html(&original);
            Ok(AiResponse { original, formatted })
        } else {
            Err("No response from Mistral API for knowledge discovery".to_string())
        }
    }
} 