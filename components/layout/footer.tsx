export function Footer() {
  return (
    <footer className="border-t border-light-border dark:border-dark-border py-4 px-6">
      <div className="max-w-7xl mx-auto text-center space-y-1.5">
        <p className="text-xs text-light-text-muted dark:text-text-secondary tracking-wide label-dt">
          © {new Date().getFullYear()} CHRIST J. — Tous droits réservés
        </p>
        <p>
          <a
            href="/admin/login"
            className="text-[10px] tracking-wide"
            style={{ color: '#555555' }}
          >
            Administration · /admin/login
          </a>
        </p>
      </div>
    </footer>
  )
}
