/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 优化图片处理
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 启用压缩和优化
  compress: true,
  
  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 页面扩展
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 排除某些包从客户端捆绑
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // Webpack 配置优化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 客户端不打包某些服务器端模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    // 优化 SVG 处理
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
}

module.exports = nextConfig
