// Оболочка MiniAppHub для Windows (Tauri 2).
// Интерфейса нет: окно показывает www/index.html — страницу с iframe-песочницей.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("ошибка запуска MiniAppHub");
}
