type InlineReferenceElementLabel =
  | "Extracted invoice values"
  | "Company wallet"
  | "Company meal statistics";

type InlineReferenceElementProps = {
  label: InlineReferenceElementLabel;
  className: string;
  role?: string;
};

export function InlineReferenceElement({
  label,
  className,
  role,
}: InlineReferenceElementProps) {
  return (
    <div className={className} role={role} aria-label={label}>
      {label === "Extracted invoice values" ? (
        <>
          <p>EXTRACTED VALUES</p>
          <dl>
            <div>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                focusable="false"
              >
                <path d="M5 3.5h9l5 5v12H5z" />
                <path d="M14 3.5v5h5M8 13h8M8 17h5" />
              </svg>
              <dt>Transaction ID</dt>
              <dd>INV-1042</dd>
            </div>
            <div>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                focusable="false"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M15.5 8.5c-.7-.7-1.6-1-2.8-1-1.5 0-2.5.8-2.5 1.9 0 3 5.2 1.4 5.2 4.5 0 1.3-1.1 2.2-2.9 2.2-1.3 0-2.4-.4-3.1-1.2M12.5 5.5v13" />
              </svg>
              <dt>Total</dt>
              <dd>2,280.00</dd>
            </div>
            <div>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                focusable="false"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8 12.2 2.6 2.6 5.6-5.6" />
              </svg>
              <dt>Status</dt>
              <dd>Verified</dd>
            </div>
          </dl>
        </>
      ) : label === "Company wallet" ? (
        <>
          <span className="mesa-wallet-brand">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              focusable="false"
            >
              <path d="M3.5 19.5h17M5.5 17V8.5L12 4l6.5 4.5V17" />
              <path d="M9 10.5h6M9 13.5h6" />
            </svg>
            <span className="mesa-wallet-label">COMPANY WALLET</span>
          </span>
          <span className="mesa-wallet-amount">
            <span>C$49,760</span>
            <small className="mesa-wallet-debit">−C$240</small>
          </span>
          <span className="mesa-wallet-status">
            <span className="mesa-wallet-before">BALANCE</span>
            <span
              className="mesa-wallet-after"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="mesa-paid-check">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  focusable="false"
                >
                  <path d="m5 12.5 4.2 4.2L19 7" />
                </svg>
              </span>
              PAID
            </span>
          </span>
        </>
      ) : (
        <>
          <p>COMPANY OVERVIEW / TODAY</p>
          <div className="mesa-dashboard-summary">
            <div>
              <strong>52</strong>
              <span>Products today</span>
            </div>
            <div>
              <strong>C$12,480</strong>
              <span>Total sales</span>
            </div>
            <svg
              className="mesa-chart"
              aria-hidden="true"
              viewBox="0 0 64 32"
              width="64"
              height="32"
              fill="currentColor"
              focusable="false"
            >
              <rect x="2" y="19" width="7" height="11" rx="1" />
              <rect x="14" y="13" width="7" height="17" rx="1" />
              <rect x="26" y="21" width="7" height="9" rx="1" />
              <rect x="38" y="8" width="7" height="22" rx="1" />
              <rect x="50" y="3" width="7" height="27" rx="1" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
