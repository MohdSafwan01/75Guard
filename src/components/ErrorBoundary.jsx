/**
 * 75Guard - Error Boundary Component
 * 
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the whole app.
 */

import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        // Log error for debugging
        console.error('75Guard Error:', error);
        console.error('Component Stack:', errorInfo?.componentStack);

        // Could send to error reporting service here
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleClearData = () => {
        // Clear potentially corrupted localStorage data
        try {
            localStorage.removeItem('75guard-storage');
            window.location.reload();
        } catch (e) {
            console.error('Failed to clear data:', e);
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-5xl mb-4">⚠️</div>

                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            75Guard encountered an error. This might be due to corrupted data or a bug.
                        </p>

                        {/* Error details (collapsed by default) */}
                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700">
                                    Technical details
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={this.handleClearData}
                                className="w-full py-3 px-4 border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                            >
                                Clear Data & Restart
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            If this keeps happening, try clearing your browser data.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
