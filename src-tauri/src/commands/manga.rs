use serde::{Deserialize, Serialize};
use once_cell::sync::Lazy;
use regex::Regex;

const MANGADEX_API: &str = "https://api.mangadex.org";
const USER_AGENT: &str = "mangadex-downloader-gui/2.0 (personal use)";

static UUID_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}").unwrap()
});

fn normalize_manga_id(raw: &str) -> Result<String, String> {
    let input = raw.trim();
    if UUID_RE.is_match(input) {
        Ok(UUID_RE.find(input).unwrap().as_str().to_lowercase())
    } else {
        Err("รูปแบบ Title ID ไม่ถูกต้อง (ต้องเป็น UUID หรือวาง URL จาก MangaDex)".into())
    }
}

// ---------- Response structs ----------

#[derive(Deserialize)]
struct CoverAttributes {
    #[serde(rename = "fileName")]
    file_name: Option<String>,
}

#[derive(Deserialize)]
struct Relationship {
    #[serde(rename = "type")]
    rel_type: String,
    attributes: Option<CoverAttributes>,
}

#[derive(Deserialize)]
struct MangaAttributes {
    title: serde_json::Value,
    #[serde(rename = "availableTranslatedLanguages")]
    available_translated_languages: Option<Vec<Option<String>>>,
}

#[derive(Deserialize)]
struct MangaData {
    id: String,
    attributes: MangaAttributes,
    relationships: Option<Vec<Relationship>>,
}

#[derive(Deserialize)]
struct MangaResponse {
    data: MangaData,
}

// ---------- Output structs ----------

#[derive(Serialize)]
pub struct MangaInfo {
    pub id: String,
    pub title: String,
    pub cover_url: Option<String>,
    pub available_langs: Vec<String>,
}

#[derive(Serialize)]
pub struct ChapterInfo {
    pub id: String,
    pub chapter: Option<String>,
    pub title: Option<String>,
    pub pages: u32,
}

// ---------- Commands ----------

#[tauri::command]
pub async fn fetch_manga_info(manga_id: String) -> Result<MangaInfo, String> {
    let id = normalize_manga_id(&manga_id)?;
    let client = reqwest::Client::new();

    let url = format!("{}/manga/{}?includes[]=cover_art", MANGADEX_API, id);
    let res = client
        .get(&url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("หา Title ID นี้ไม่เจอ ({})", res.status()));
    }

    let body: MangaResponse = res.json().await.map_err(|e| e.to_string())?;
    let data = body.data;
    let attrs = data.attributes;

    // เลือกชื่อเรื่อง: en → ja → อันแรกที่เจอ
    let title = attrs.title.get("en")
        .or_else(|| attrs.title.get("ja"))
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| {
            attrs.title.as_object()
                .and_then(|m| m.values().next())
                .and_then(|v| v.as_str())
                .unwrap_or("(ไม่มีชื่อ)")
        })
        .to_string();

    // หา cover
    let cover_url = data.relationships.as_deref().unwrap_or(&[])
        .iter()
        .find(|r| r.rel_type == "cover_art")
        .and_then(|r| r.attributes.as_ref())
        .and_then(|a| a.file_name.as_ref())
        .map(|f| format!("https://uploads.mangadex.org/covers/{}/{}.256.jpg", id, f));

    let available_langs = attrs.available_translated_languages
        .unwrap_or_default()
        .into_iter()
        .flatten()
        .collect();

    Ok(MangaInfo { id, title, cover_url, available_langs })
}

#[tauri::command]
pub async fn fetch_chapters_for_lang(manga_id: String, lang: String) -> Result<Vec<ChapterInfo>, String> {
    let id = normalize_manga_id(&manga_id)?;
    let client = reqwest::Client::new();
    let mut chapters: Vec<ChapterInfo> = Vec::new();
    let mut seen_ids = std::collections::HashSet::new();
    let mut offset = 0u32;
    let limit = 100u32;

    loop {
        let url = format!(
            "{}/manga/{}/feed?translatedLanguage[]={}&order[chapter]=desc&limit={}&offset={}",
            MANGADEX_API, id, lang, limit, offset
        );

        let res = client
            .get(&url)
            .header("User-Agent", USER_AGENT)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !res.status().is_success() {
            return Err(format!("ดึงรายการตอนไม่สำเร็จ: {}", res.status()));
        }

        let body: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
        let data = body["data"].as_array().ok_or("data format error")?;

        if data.is_empty() { break; }

        for item in data {
            let chapter_id = item["id"].as_str().unwrap_or("").to_string();
            if seen_ids.contains(&chapter_id) { continue; }
            seen_ids.insert(chapter_id.clone());

            let attrs = &item["attributes"];
            chapters.push(ChapterInfo {
                id: chapter_id,
                chapter: attrs["chapter"].as_str().map(|s| s.to_string()),
                title: attrs["title"].as_str().map(|s| s.to_string()),
                pages: attrs["pages"].as_u64().unwrap_or(0) as u32,
            });
        }

        let total = body["total"].as_u64().unwrap_or(0) as u32;
        offset += limit;
        if offset >= total || (data.len() as u32) < limit { break; }
    }

    chapters.reverse();
    Ok(chapters)
}