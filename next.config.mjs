/** @type {import('next').NextConfig} */
const nextConfig = {
  // File tracing options moved to root level as per Next.js warnings
  outputFileTracingIncludes: {},
  outputFileTracingExcludes: {},
  outputFileTracingRoot: process.cwd(),
  
  // Next.js 15.3.0 doesn't support the telemetry option at root level
  // so we're removing it to avoid warnings
  
  // Increase timeouts for slower systems
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Use more specific configuration for Windows systems
  webpack: (config, { isServer }) => {
    // Additional webpack configuration for Windows compatibility
    return config;
  },
};

export default nextConfig;
