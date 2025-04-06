import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';


export default defineConfig(({ command, mode }) => {
  // command is 'serve' (dev) or 'build'
  const isProduction = command === 'build' || mode === 'production';
  
  // Základní konfigurace
  const config = {
    plugins: [plugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  };

  if (!isProduction) {
      const baseFolder =
          env.APPDATA !== undefined && env.APPDATA !== ''
              ? `${env.APPDATA}/ASP.NET/https`
              : `${env.HOME}/.aspnet/https`;

      const certificateName = "reactapp1.client";
      const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
      const keyFilePath = path.join(baseFolder, `${certificateName}.key`);


      if (!fs.existsSync(baseFolder)) {
          fs.mkdirSync(baseFolder, { recursive: true });
      }

      if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
          if (0 !== child_process.spawnSync('dotnet', [
              'dev-certs',
              'https',
              '--export-path',
              certFilePath,
              '--format',
              'Pem',
              '--no-password',
          ], { stdio: 'inherit', }).status) {
              throw new Error("Could not create certificate.");
          }
      }
      const devServerConfig = {
          port: parseInt(env.DEV_SERVER_PORT || '49837'),
          https: fs.existsSync(certFilePath) && fs.existsSync(keyFilePath) ? {
              key: fs.readFileSync(keyFilePath),
              cert: fs.readFileSync(certFilePath),
          } : undefined
      };

      const target = env.ASPNETCORE_HTTPS_PORT
          ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
          : env.ASPNETCORE_URLS
              ? env.ASPNETCORE_URLS.split(';')[0]
              : 'https://localhost:7205';
      return {
        ...config,
        server: {
          proxy: {
             '^/weatherforecast': {
                 target,
                 secure: false
             }
          },
          ...devServerConfig
        }
    };
  }

  // Vrátí základní konfiguraci pro produkční prostředí
  return config;
});

