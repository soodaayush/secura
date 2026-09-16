import React from 'react';

interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
}

// Ensures a native map failure (e.g. an Expo Go environment without the
// native map module available) never crashes the demo — we degrade to a
// styled placeholder instead.
export class MapErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[CampusMap] falling back to placeholder map:', error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
