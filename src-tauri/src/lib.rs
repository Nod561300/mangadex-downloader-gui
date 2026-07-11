mod commands;

use commands::{
    download::{cancel_download, retry_failed_pages, start_download},
    manga::{fetch_chapters_for_lang, fetch_manga_info},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            fetch_manga_info,
            fetch_chapters_for_lang,
            start_download,
            cancel_download,
            retry_failed_pages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
