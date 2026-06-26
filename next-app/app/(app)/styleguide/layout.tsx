import { notFound } from "next/navigation";

/**
 * Styleguide — внутренний design-lab (эксперименты тем). Не часть продукта:
 * в production-сборке раздел скрыт (404), в dev доступен как обычно.
 */
export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <>{children}</>;
}
