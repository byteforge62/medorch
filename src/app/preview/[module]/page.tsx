import { PreviewClient } from './PreviewClient';

/*
 * Isolated visual preview route.
 *
 * Renders the real module components with a stubbed transport so the shipped
 * UI can be inspected without a database. Never linked from the product, never
 * indexed, and excluded from the sitemap.
 */
export const metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;

  return <PreviewClient module={module} />;
}
