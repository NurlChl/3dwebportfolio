import { Box } from "lucide-react";
import { loginAction } from "@/app/admin/actions";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="shell section" style={{ maxWidth: 520 }}>
      <div className="brand" style={{ marginBottom: 28 }}>
        <span className="brand-mark"><Box size={19} /></span>
        <span>Portfolio CMS</span>
      </div>
      <form action={loginAction} className="panel form-grid">
        <h1 style={{ fontSize: 42 }}>Admin Login</h1>
        {params.error ? <p style={{ color: "var(--coral)", fontWeight: 800 }}>Email atau password salah.</p> : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button className="btn primary" type="submit">Masuk CMS</button>
      </form>
    </main>
  );
}
