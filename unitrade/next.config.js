/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mvqqyesdlcbbytapiapf.supabase.co'],
  },
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
