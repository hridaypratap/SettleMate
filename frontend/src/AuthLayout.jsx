function AuthLayout({
  children,
  showLogin,
  onToggleAuth,
  theme,
  onToggleTheme
}) {
  return (
    <div className="auth-page">

      <div className="auth-brand">
        <div className="auth-brand-icon">
          <span>₹</span>
        </div>

        <span>Settlemate</span>
      </div>

      <button
        className="auth-theme-toggle"
        onClick={onToggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="auth-container">

        {/* Left side */}

        <section className="auth-showcase">

          <div className="showcase-badge">
            SIMPLE · SMART · SETTLED
          </div>

          <h1>
            Split expenses.
            <br />
            <span>Stay settled.</span>
          </h1>

          <p>
            Settlemate makes group expenses simple.
            Track who paid, who owes, and settle debts
            without the awkward calculations.
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <div className="feature-icon">₹</div>
              <div>
                <h3>Smart Expense Splitting</h3>
                <p>Split bills equally or customize everyone's share.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">⇄</div>
              <div>
                <h3>Automatic Debt Simplification</h3>
                <p>Find the simplest way to settle group debts.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <h3>Clear & Transparent</h3>
                <p>Everyone knows exactly who owes whom.</p>
              </div>
            </div>

          </div>

          <div className="showcase-preview">

            <div className="preview-header">
              <span>Weekend Trip</span>
              <span>5 members</span>
            </div>

            <div className="preview-row">
              <span>Total expenses</span>
              <strong>₹8,450</strong>
            </div>

            <div className="preview-row">
              <span>You are owed</span>
              <strong className="preview-positive">
                ₹1,250
              </strong>
            </div>

            <div className="preview-settlement">
              <span>✓</span>
              <span>3 transactions to settle everything</span>
            </div>

          </div>

        </section>

        {/* Right side */}

        <section className="auth-card">

          {children}

          <div className="auth-switch">
            {showLogin ? (
              <>
                <span>Don't have an account?</span>

                <button onClick={onToggleAuth}>
                  Create account
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>

                <button onClick={onToggleAuth}>
                  Sign in
                </button>
              </>
            )}
          </div>

        </section>

      </div>

      <p className="auth-footer">
        © 2026 Settlemate · Expense sharing made simple
      </p>

    </div>
  )
}

export default AuthLayout