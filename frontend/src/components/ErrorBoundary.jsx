import { Component } from "react";
import { Warning } from "@phosphor-icons/react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="shell page">
        <div style={{ maxWidth: "52ch" }}>
          <Warning size={28} color="var(--st-cancelled)" />
          <h1 style={{ marginTop: "var(--sp-4)" }}>This page stopped responding</h1>
          <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
            Nothing you entered was sent anywhere. Reload to try again — if it keeps
            happening, the details are in the browser console.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-5)" }}>
            <button className="btn btn--primary" onClick={() => window.location.reload()}>
              Reload the page
            </button>
            <a className="btn btn--secondary" href="/">
              Back to start
            </a>
          </div>
        </div>
      </div>
    );
  }
}
