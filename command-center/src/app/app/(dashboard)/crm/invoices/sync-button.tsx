'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Check, AlertCircle } from 'lucide-react';
import { syncQBInvoice } from '@/app/actions/invoices';
import { toast } from 'sonner';

interface SyncButtonProps {
    invoiceId: string;
    hasConnection: boolean;
}

export function SyncButton({ invoiceId, hasConnection }: SyncButtonProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!hasConnection) return null;

    const handleSync = async () => {
        setLoading(true);
        setStatus('idle');
        try {
            const result = await syncQBInvoice(invoiceId);
            if (result.success) {
                setStatus('success');
                toast.success('QuickBooks Sync Successful', {
                    description: 'Invoice and payment link have been updated.'
                });
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                toast.error('QuickBooks Sync Failed', {
                    description: result.error || 'Unknown error occurred'
                });
            }
        } catch (err) {
            setStatus('error');
            toast.error('Error', { description: 'Failed to trigger sync' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={loading}
            className={`gap-2 ${status === 'success' ? 'text-green-600 border-green-200 bg-green-50' : ''}`}
            title="Sync with QuickBooks"
        >
            {loading ? (
                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
            ) : status === 'success' ? (
                <Check className="h-3.5 w-3.5" />
            ) : status === 'error' ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            ) : (
                <RefreshCcw className="h-3.5 w-3.5 text-blue-500" />
            )}
            {loading ? 'Syncing...' : status === 'success' ? 'Synced' : 'QB Sync'}
        </Button>
    );
}
