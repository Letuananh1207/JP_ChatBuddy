import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./", // relative path cho build → mở bằng file:// sẽ load đúng
  plugins: [react(), tailwindcss()],
});
