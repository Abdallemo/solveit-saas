import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  experimental:{
    
    serverActions:{
      bodySizeLimit:'100mb'
    }
  }
};

export default withAnalyzer(nextConfig);
