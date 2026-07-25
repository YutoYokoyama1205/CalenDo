import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// FlaskバックエンドへのプロキシでCORS問題を回避
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://127.0.0.1:5000",
      "/tasks": "http://127.0.0.1:5000",
      "/add_task": "http://127.0.0.1:5000",
      "/delete_task": "http://127.0.0.1:5000",
      "/edit_task": "http://127.0.0.1:5000",
      "/check_box": "http://127.0.0.1:5000",
      "/achievement_rate": "http://127.0.0.1:5000",
      "/week_tasks": "http://127.0.0.1:5000",
    },
  },
});
