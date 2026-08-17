import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default ({ mode }: { mode: string }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");

    return defineConfig({
        plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
        define: {
            "process.env": env,
        },
    });
};
