import type { AuthUser } from "../types/auth";

type DashboardPageProps = {
  user: AuthUser;
};

export function DashboardPage({ user }: DashboardPageProps) {
  return (
    <section className="card">
      <h2>Dashboard</h2>
      <p>Signed in as {user.email}</p>
      <p>
        Next stage will add upload pipeline, document listing, viewer, and extracted data
        rendering.
      </p>
    </section>
  );
}
