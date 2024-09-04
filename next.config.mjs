/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    typescript: {
      // Ignore TypeScript errors during the build process
      ignoreBuildErrors: true,
    },
};
export default nextConfig;
