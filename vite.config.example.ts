import {
  defineConfig 
} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({
  command 
}) => {
  const isBuild = command === "build";

  return {
    root: "example", 
    base: isBuild ? "/react-simple-signature/" : "/",
    plugins: [react()],
    build: {
      outDir: "../dist",
      emptyOutDir: true,
    },
  };
});