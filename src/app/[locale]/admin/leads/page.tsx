import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminLeadsClient } from "./AdminLeadsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Leads",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Public route, but the data behind it is gated by Basic-Auth on the
 * /api/admin/leads endpoint. The browser will prompt for credentials on
 * the first fetch; the unauthorised state is rendered until the user
 * authenticates. No server-side gate here because Next 16's middleware
 * doesn't run on the Worker — auth happens at the API edge.
 */
export default async function AdminLeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminLeadsClient />;
}
