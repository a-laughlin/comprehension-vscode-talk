import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(configEnv=>{
  return {
    build: {
      // outDir: 'dist',
      minify: configEnv.mode === 'development' ? false : 'esbuild', // esbuild is default
      sourcemap: configEnv.mode === 'development' ? false : true,
    },
    plugins: [
      react()
    ],
  };
});
