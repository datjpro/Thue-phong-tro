import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  typescript: {
    // Checked via `pnpm typecheck` (`tsc --noEmit`)
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
