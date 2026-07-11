mod commands;

use commands::{download::start_download, manga::{fetch_manga_info, fetch_chapters_for_lang}};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            fetch_manga_info,
            fetch_chapters_for_lang,
            start_download,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}