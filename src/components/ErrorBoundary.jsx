import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-background text-foreground p-8">
          <div className="max-w-lg space-y-4 text-center">
            <h2 className="text-xl font-semibold text-red-400">Algo salió mal</h2>
            <pre className="text-xs text-left bg-red-950/30 border border-red-900/50 rounded-lg p-4 overflow-auto max-h-60 whitespace-pre-wrap">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm cursor-pointer"
              onClick={() => {
                localStorage.removeItem('n3xo-storage');
                window.location.reload();
              }}
            >
              Reset (clear data)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
