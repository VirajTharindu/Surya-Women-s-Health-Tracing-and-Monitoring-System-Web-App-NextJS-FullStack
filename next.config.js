/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Required for Docker standalone build (produces a self-contained server.js)
  output: 'standalone',

  // i18n config will be added here or via next-i18next
};

module.exports = nextConfig;
