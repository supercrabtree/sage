use std::env;

#[derive(Clone)]
pub struct AppConfig {
    pub mistral_api_key: String,
    pub model: String,
    pub max_tokens: u32,
    pub temperature: f32,
    pub option_model: String,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, String> {
        let mistral_api_key = env::var("MISTRAL_API_KEY")
            .map_err(|_| "Mistral API key not configured")?;
        
        Ok(Self {
            mistral_api_key,
            model: env::var("MISTRAL_MODEL").unwrap_or("mistral-small-2506".to_string()),
            max_tokens: env::var("MISTRAL_MAX_TOKENS").ok().and_then(|s| s.parse().ok()).unwrap_or(1000),
            temperature: env::var("MISTRAL_TEMPERATURE").ok().and_then(|s| s.parse().ok()).unwrap_or(0.7),
            option_model: env::var("MISTRAL_OPTION_MODEL").unwrap_or("open-mistral-7b".to_string()),
        })
    }
} 