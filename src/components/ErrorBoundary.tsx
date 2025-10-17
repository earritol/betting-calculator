import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, ErrorBoundaryState> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">Algo salió mal</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}