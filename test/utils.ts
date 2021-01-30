// Create error here on first line so that line numbers do not change
export const mockError = new Error('mock error');
mockError.stack = sanitizeStackTrace(mockError.stack);

/**
 * Sanitize possible stack traces for sensitive paths
 * - Removes absolute root path from stack traces, e.g.
 *   `/home/username/path/to/project/...` -> `<removed>/...`
 * - Guarantees identical stack traces between environments
 */
export function sanitizeStackTrace(message?: string): string {
    return (message || '').replace(new RegExp(process.cwd(), 'g'), '<removed>');
}
