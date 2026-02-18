import React, { Component, ErrorInfo, ReactNode } from 'react';
import { exportData, resetApp } from '../services/storageService';
import { AlertTriangle, Download, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: { hasError: boolean; error: any; errorInfo: any; };
    props: any;
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Yomate Crash Report:', error, errorInfo);
        this.setState({ errorInfo });
    }
    setState(arg0: { errorInfo: ErrorInfo; }) {
        throw new Error('Method not implemented.');
    }

    handleReload = () => {
        window.location.reload();
    };

    handleExportAndReset = () => {
        try {
            exportData();
        } catch (e) {
            console.error('Failed to export data:', e);
        }
        if (confirm('Data exported. Reset app to fix the crash?')) {
            resetApp();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-[100dvh] w-full bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-sm text-center space-y-6">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
                            <AlertTriangle size={40} className="text-rose-500" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">System Crash</h1>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Something went wrong. Your data is safe — you can export a backup before resetting.
                            </p>
                        </div>

                        <details className="text-left">
                            <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors font-mono uppercase tracking-wider">
                                Error Details
                            </summary>
                            <div className="mt-3 p-4 bg-black rounded-xl border border-zinc-800 overflow-auto max-h-32">
                                <pre className="text-[10px] text-rose-400 font-mono whitespace-pre-wrap break-words">
                                    {this.state.error?.message || 'Unknown error'}
                                </pre>
                                {this.state.errorInfo && (
                                    <pre className="text-[9px] text-zinc-600 font-mono whitespace-pre-wrap break-words mt-2">
                                        {this.state.errorInfo.componentStack?.slice(0, 500)}
                                    </pre>
                                )}
                            </div>
                        </details>

                        <div className="space-y-3 pt-2">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors active:scale-95 shadow-lg"
                            >
                                <RefreshCw size={18} />
                                Reload App
                            </button>

                            <button
                                onClick={this.handleExportAndReset}
                                className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors active:scale-95"
                            >
                                <Download size={16} />
                                Export Data & Reset
                            </button>
                        </div>

                        <p className="text-[10px] text-zinc-700 font-mono">
                            Yomate Recovery Mode
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
