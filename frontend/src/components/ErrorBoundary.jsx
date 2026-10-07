import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
          <p className="text-4xl" aria-hidden="true">🔥</p>
          <h1 className="text-2xl font-bold">Algo se quemó en la cocina</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Ocurrió un error inesperado. Tus datos están a salvo; probá recargar la página.
            Si el problema persiste, contactá al administrador.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Recargar
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
