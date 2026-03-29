import LoginPage from './login-wrapper'

export default function Page() {
  return (
    <div className="min-h-screen text-[var(--wa-text)] [background:var(--wa-bg)] [background-image:radial-gradient(circle_at_16%_10%,rgba(245,158,11,0.12),transparent_36%),radial-gradient(circle_at_82%_5%,rgba(16,185,129,0.1),transparent_30%)]">
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
        <LoginPage />
      </div>
    </div>
  )
}
