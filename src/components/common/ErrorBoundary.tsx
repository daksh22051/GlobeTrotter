import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled application render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen w-full bg-[#FFFDF8] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE6DD] shadow-xs p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FFF2EE] text-[#E55837] flex items-center justify-center text-2xl">
              !
            </div>
            <h1 className="text-xl font-extrabold text-[#17201D]">Something went wrong</h1>
            <p className="text-sm text-[#68736F] mt-2">Click to reload and try again.</p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 px-5 py-2.5 rounded-full bg-[#17201D] text-white text-sm font-bold hover:bg-[#FF6B4A] transition-colors cursor-pointer"
            >
              Reload
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}