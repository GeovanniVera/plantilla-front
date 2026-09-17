import { Component, type ReactNode } from 'react';
import ErrorLayout from '../layouts/ErrorLayout';

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

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ErrorLayout
          image="/500.png"
          imageAlt="Error"
          title="Algo salió mal"
          description="Ocurrió un error inesperado al cargar esta sección. Podés reintentar o volver al inicio."
          actions={
            <>
              <button
                onClick={this.handleGoHome}
                className="border-border-base bg-background text-foreground hover:border-accent-line hover:text-heading cursor-pointer rounded-md border px-5 py-2 text-[13px] font-semibold transition-colors"
              >
                Ir al dashboard
              </button>
              <button
                onClick={this.handleRetry}
                className="border-accent-border bg-accent-bg text-accent hover:bg-accent cursor-pointer rounded-md border px-5 py-2 text-[13px] font-semibold transition-colors hover:text-white"
              >
                Reintentar
              </button>
            </>
          }
        />
      );
    }

    return this.props.children;
  }
}
