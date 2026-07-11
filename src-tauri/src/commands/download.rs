use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio::time::{sleep, Duration};
use std::sync::Arc;
use tokio::sync::Mutex;

const MANGADEX_API: &str = "https://api.mangadex.org";
const USER_AGENT: &str = "mangadex-downloader-gui/2.0 (personal use)";
const AT_HOME_GAP_MS: u64 = 1000;
const CONCURRENCY: usize = 3;

// Sequential queue สำหรับ at-home/server เหมือนเดิม
static AT_HOME_LOCK: Lazy<tokio::sync::Mutex<()>> = Lazy::new(|| tokio::sync::Mutex::new(()));

// Global flag ให้ cancel download
static CANCEL_DOWNLOAD: Lazy<Arc<Mutex<bool>>> = Lazy::new(|| Arc::new(Mutex::new(false)));
#[derive(Deserialize)]
pub struct ChapterInput {
    pub id: String,
    pub chapter: Option<String>,
}

#[derive(Deserialize)]
pub struct DownloadPayload {
    pub manga_title: String,
    pub output_dir: String,
    pub chapters: Vec<ChapterInput>,
}

#[derive(Serialize, Clone)]
pub struct PageProgress {
    chapter_id: String,
    label: String,
    current: u32,
    total: u32,
}

#[derive(Serialize, Clone)]
pub struct ChapterProgress {
    completed: u32,
    total: u32,
}

#[derive(Serialize, Clone)]
pub struct Problem {
    label: String,
    failed_pages: i32,
    total: u32,
    error: Option<String>,
}

#[derive(Serialize)]
pub struct DownloadResult {
    ok: bool,
    completed_chapters: u32,
    total: u32,
    problems: Vec<Problem>,
}

#[tauri::command]
pub async fn cancel_download() -> Result<(), String> {
    let mut cancelled = CANCEL_DOWNLOAD.lock().await;
    *cancelled = true;
    Ok(())
}

fn sanitize_folder_name(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .filter(|c| !r#"\/:*?"<>|"#.contains(*c))
        .collect();
    let cleaned = cleaned.trim().to_string();
    if cleaned.is_empty() || cleaned == "." || cleaned == ".." {
        return "manga".to_string();
    }
    cleaned
}

async fn fetch_at_home_server(
    client: &reqwest::Client,
    chapter_id: &str,
) -> Result<serde_json::Value, String> {
    // lock ทำให้เป็น sequential + เว้น gap หลัง unlock
    let _guard = AT_HOME_LOCK.lock().await;
    let url = format!("{}/at-home/server/{}", MANGADEX_API, chapter_id);
    let mut retries = 4u32;
    let mut delay_ms = 2000u64;

    loop {
        let res = client
            .get(&url)
            .header("User-Agent", USER_AGENT)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if res.status() == 429 {
            if retries == 0 {
                return Err("at-home server: ถูก rate limit เกินจำนวนครั้งที่ retry".into());
            }
            sleep(Duration::from_millis(delay_ms)).await;
            delay_ms *= 2;
            retries -= 1;
            continue;
        }

        if !res.status().is_success() {
            return Err(format!("at-home server error: {}", res.status()));
        }

        let body = res
            .json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())?;
        sleep(Duration::from_millis(AT_HOME_GAP_MS)).await;
        return Ok(body);
    }
}

async fn download_chapter(
    client: &reqwest::Client,
    chapter_id: &str,
    target_dir: &std::path::Path,
    label: &str,
    app: &AppHandle,
) -> Result<(u32, u32), String> {
    // Check if cancelled before starting
    if *CANCEL_DOWNLOAD.lock().await {
        return Err("Download cancelled by user".into());
    }

    let server = fetch_at_home_server(client, chapter_id).await?;
    let base_url = server["baseUrl"]
        .as_str()
        .ok_or("missing baseUrl")?
        .to_string();
    let hash = server["chapter"]["hash"]
        .as_str()
        .ok_or("missing hash")?
        .to_string();
    let pages: Vec<String> = server["chapter"]["data"]
        .as_array()
        .ok_or("missing data")?
        .iter()
        .filter_map(|v| v.as_str().map(|s| s.to_string()))
        .collect();

    let chapter_dir = target_dir.join(sanitize_folder_name(label));
    tokio::fs::create_dir_all(&chapter_dir)
        .await
        .map_err(|e| e.to_string())?;

    let existing: std::collections::HashSet<String> = tokio::fs::read_dir(&chapter_dir)
        .await
        .ok()
        .map(|mut rd| {
            let mut set = std::collections::HashSet::new();
            // sync read สำหรับ initial scan
            if let Ok(entries) = std::fs::read_dir(&chapter_dir) {
                for e in entries.flatten() {
                    set.insert(e.file_name().to_string_lossy().to_string());
                }
            }
            set
        })
        .unwrap_or_default();

    let total = pages.len() as u32;
    let mut failed = 0u32;

    for (i, filename) in pages.iter().enumerate() {
        // Check if cancelled before each page
        if *CANCEL_DOWNLOAD.lock().await {
            return Err("Download cancelled by user".into());
        }

        let page_num = format!("{:03}", i + 1);
        let ext = std::path::Path::new(filename)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("jpg");
        let save_name = format!("page-{}.{}", page_num, ext);

        if !existing.contains(&save_name) {
            let image_url = format!("{}/data/{}/{}", base_url, hash, filename);

            // retry 3 ครั้ง
            let mut ok = false;
            for _ in 0..3 {
                match client
                    .get(&image_url)
                    .header("User-Agent", USER_AGENT)
                    .send()
                    .await
                {
                    Ok(res) if res.status().is_success() => {
                        if let Ok(bytes) = res.bytes().await {
                            let save_path = chapter_dir.join(&save_name);
                            if tokio::fs::write(&save_path, &bytes).await.is_ok() {
                                ok = true;
                                break;
                            }
                        }
                    }
                    _ => {}
                }
                sleep(Duration::from_millis(500)).await;
            }

            if !ok {
                failed += 1;
            }
            sleep(Duration::from_millis(250)).await;
        }

        let _ = app.emit(
            "page-progress",
            PageProgress {
                chapter_id: chapter_id.to_string(),
                label: label.to_string(),
                current: (i + 1) as u32,
                total,
            },
        );
    }

    Ok((total, failed))
}

#[tauri::command]
pub async fn start_download(
    app: AppHandle,
    payload: DownloadPayload,
) -> Result<DownloadResult, String> {
    // Reset cancel flag
    *CANCEL_DOWNLOAD.lock().await = false;

    let total = payload.chapters.len() as u32;
    let target_dir =
        std::path::Path::new(&payload.output_dir).join(sanitize_folder_name(&payload.manga_title));

    tokio::fs::create_dir_all(&target_dir)
        .await
        .map_err(|e| e.to_string())?;

    let client = reqwest::Client::new();
    let chapters = payload.chapters;

    // concurrency pool ด้วย semaphore
    let semaphore = std::sync::Arc::new(tokio::sync::Semaphore::new(CONCURRENCY));
    let problems = std::sync::Arc::new(tokio::sync::Mutex::new(Vec::<Problem>::new()));
    let completed = std::sync::Arc::new(tokio::sync::Mutex::new(0u32));

    let mut handles = Vec::new();

    for chapter in chapters {
        // Check if cancelled before spawning new task
        if *CANCEL_DOWNLOAD.lock().await {
            break;
        }

        let permit = semaphore
            .clone()
            .acquire_owned()
            .await
            .map_err(|e| e.to_string())?;
        let client = client.clone();
        let target_dir = target_dir.clone();
        let app = app.clone();
        let problems = problems.clone();
        let completed = completed.clone();
        let label = format!(
            "Ch.{} ({})",
            chapter.chapter.as_deref().unwrap_or("Oneshot"),
            chapter.id
        );

        let handle = tokio::spawn(async move {
            let _permit = permit;
            let _ = app.emit("download-log", format!("กำลังโหลด: {}", label));

            match download_chapter(&client, &chapter.id, &target_dir, &label, &app).await {
                Ok((page_total, failed_pages)) => {
                    if failed_pages > 0 {
                        problems.lock().await.push(Problem {
                            label: label.clone(),
                            failed_pages: failed_pages as i32,
                            total: page_total,
                            error: None,
                        });
                    }
                }
                Err(e) => {
                    problems.lock().await.push(Problem {
                        label: label.clone(),
                        failed_pages: -1,
                        total: 0,
                        error: Some(e),
                    });
                }
            }

            let mut c = completed.lock().await;
            *c += 1;
            let _ = app.emit(
                "chapter-progress",
                ChapterProgress {
                    completed: *c,
                    total,
                },
            );
        });

        handles.push(handle);
    }

    for h in handles {
        let _ = h.await;
    }

    let problems = problems.lock().await.clone();
    let completed = *completed.lock().await;

    Ok(DownloadResult {
        ok: true,
        completed_chapters: completed,
        total,
        problems,
    })
}
