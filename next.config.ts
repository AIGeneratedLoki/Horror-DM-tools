
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Horror-DM-tools'
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      '*.cloudworkstations.dev',
    ]
  },
};

export default nextConfig;
