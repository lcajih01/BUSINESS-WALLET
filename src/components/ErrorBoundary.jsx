import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    try { localStorage.removeItem('hotel-wallet-v2'); } catch (_) {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 28, background: '#F5F0E8', gap: 12, textAlign: 'center',
        }}>
          <p style={{ fontSize: 52 }}>⚠️</p>
          <p style={{ fontWeight: 700, fontSize: 18, color: '#1E3A2F', margin: 0 }}>
            Something went wrong
          </p>
          <p style={{ fontSize: 13, color: '#888', maxWidth: 280, lineHeight: 1.5, margin: 0 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280, marginTop: 12 }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '13px 24px', borderRadius: 14, border: 'none',
                background: '#C0392B', color: 'white', fontWeight: 700,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Reset App (clears data)
            </button>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '11px 24px', borderRadius: 14, cursor: 'pointer',
                background: 'transparent', color: '#555', fontWeight: 600,
                fontSize: 13, border: '1px solid #ccc',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
