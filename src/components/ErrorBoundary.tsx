import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 64,
            gap: 16,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            ⚠️
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-h)' }}>
            Ups, algo falló
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text)', maxWidth: 400 }}>
            No se pudo cargar esta sección. Por favor, intentá de nuevo.
          </p>
          {this.state.error && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontFamily: 'var(--mono)',
                color: 'var(--text)',
                opacity: 0.5,
                maxWidth: 500,
                wordBreak: 'break-all',
              }}
            >
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: 8,
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid var(--accent-border)',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--sans)',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
