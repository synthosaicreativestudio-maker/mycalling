'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary для защиты от падений WebGL/Three.js.
 * Если Canvas или шейдеры выбросят исключение, 
 * страница продолжит работать — просто без 3D-фона.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[CanvasErrorBoundary] 3D scene crashed, falling back to static background:', error.message);
    console.warn(errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Возвращаем fallback (по умолчанию — ничего, остаётся статичный космический фон)
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
