/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // Static export ТОЛЬКО при production build (для GitHub Pages).
  // В dev — обычные dynamic routes без enforcement generateStaticParams,
  // чтобы несуществующие ID показывали empty state, а не runtime error.
  ...(isProd
    ? {
        output: "export",
        basePath: "/gc-prototype",
        assetPrefix: "/gc-prototype/",
      }
    : {}),

  // Required for static export (no Next.js image optimizer)
  images: { unoptimized: true },

  // Trailing slash plays nicer with GitHub Pages routing
  trailingSlash: true,

  // Skip lint/typecheck during build (we run separately in CI)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
