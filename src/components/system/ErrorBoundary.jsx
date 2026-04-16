import React from "react";
import Button from "../ui/Button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Dashboard render failure:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <main className="section">
            <div className="container">
              <div className="panel app-fallback">
                <p className="panel-label">Recovery Mode</p>
                <h1>Dashboard rendering failed</h1>
                <p>
                  The app hit an unexpected client-side error. Reload to restore the
                  latest safe local state.
                </p>
                <Button onClick={this.handleReload}>Reload dashboard</Button>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
