import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary để bắt lỗi runtime trong 3D Canvas hoặc bất kỳ subtree nào.
 * Nếu 1 model GLB lỗi hoặc WebGL crash, sẽ hiển thị UI fallback thay vì trắng trang.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfbf7] px-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-heading font-bold text-[#2a2a2a] mb-4">
              Đã xảy ra lỗi hiển thị
            </h2>
            <p className="text-stone-500 mb-6 leading-relaxed">
              Trình duyệt của bạn có thể không hỗ trợ đầy đủ đồ họa 3D, 
              hoặc đã xảy ra lỗi khi tải nội dung. Vui lòng thử tải lại trang.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Tải lại trang
            </button>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600">
                  Chi tiết lỗi (dành cho nhà phát triển)
                </summary>
                <pre className="mt-2 text-xs text-red-500 bg-red-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
