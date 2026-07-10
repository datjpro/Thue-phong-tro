'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-5">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-black text-foreground tracking-tight">
            Đã xảy ra lỗi hệ thống
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm font-semibold leading-relaxed">
            Một lỗi không mong muốn đã xảy ra. Vui lòng tải lại trang hoặc liên hệ ban quản lý
            nếu lỗi tiếp tục lặp lại.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer glow-shadow-primary"
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
