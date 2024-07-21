/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ['@xenova/transformers']
    },
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.experiments = {
          ...config.experiments,
          topLevelAwait: true,
        };
      }else{
        config.resolve.fallback.fs = false;
      }
      config.module.rules.push({
        test: /\.node$/,
        use: 'node-loader',
      });
      
      return config;
    },
  };

export default nextConfig;
