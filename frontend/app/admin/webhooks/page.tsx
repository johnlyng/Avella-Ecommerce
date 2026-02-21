'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ALL_EVENTS = ['order.created', 'order.updated', 'order.cancelled']

interface Endpoint {
    id: number
    label: string
    url: string
    events: string[]
    isActive: boolean
    createdAt: string
}

interface DeliveryLog {
    webhook_logs: {
        id: number
        event: string
        status: string
        statusCode: number | null
        errorMessage: string | null
        createdAt: string
    }
    webhook_endpoints: {
        label: string
        url: string
    } | null
}

export default function WebhooksAdminPage() {
    const { token, user } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'endpoints' | 'logs'>('endpoints')

    const [endpoints, setEndpoints] = useState<Endpoint[]>([])
    const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(true)
    const [logs, setLogs] = useState<DeliveryLog[]>([])
    const [isLoadingLogs, setIsLoadingLogs] = useState(false)

    const [showForm, setShowForm] = useState(false)
    const [formLabel, setFormLabel] = useState('')
    const [formUrl, setFormUrl] = useState('')
    const [formEvents, setFormEvents] = useState<string[]>(['order.created'])
    const [formError, setFormError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.replace('/')
        }
    }, [user, router])

    const loadEndpoints = useCallback(async () => {
        if (!token) return
        setIsLoadingEndpoints(true)
        try {
            const res = await api.getWebhookEndpoints(token)
            setEndpoints(res.data || [])
        } catch { /* ignore */ }
        finally { setIsLoadingEndpoints(false) }
    }, [token])

    const loadLogs = useCallback(async () => {
        if (!token) return
        setIsLoadingLogs(true)
        try {
            const res = await api.getWebhookLogs(token)
            setLogs(res.data || [])
        } catch { /* ignore */ }
        finally { setIsLoadingLogs(false) }
    }, [token])

    useEffect(() => { loadEndpoints() }, [loadEndpoints])
    useEffect(() => { if (activeTab === 'logs') loadLogs() }, [activeTab, loadLogs])

    const handleToggleActive = async (endpoint: Endpoint) => {
        if (!token) return
        try {
            await api.updateWebhookEndpoint(token, endpoint.id, { isActive: !endpoint.isActive })
            await loadEndpoints()
        } catch { /* ignore */ }
    }

    const handleDelete = async (id: number) => {
        if (!token || !confirm('Delete this webhook endpoint?')) return
        try {
            await api.deleteWebhookEndpoint(token, id)
            setEndpoints(prev => prev.filter(e => e.id !== id))
        } catch { /* ignore */ }
    }

    const handleToggleEvent = (event: string) => {
        setFormEvents(prev =>
            prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
        )
    }

    const handleAddEndpoint = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError('')
        if (!formLabel.trim()) return setFormError('Label is required')
        if (!formUrl.trim()) return setFormError('URL is required')
        if (formEvents.length === 0) return setFormError('Select at least one event')
        try { new URL(formUrl) } catch { return setFormError('Invalid URL format') }

        setIsSaving(true)
        try {
            await api.createWebhookEndpoint(token!, { label: formLabel, url: formUrl, events: formEvents })
            setFormLabel('')
            setFormUrl('')
            setFormEvents(['order.created'])
            setShowForm(false)
            await loadEndpoints()
        } catch (err: any) {
            setFormError(err.message || 'Failed to save endpoint')
        } finally {
            setIsSaving(false)
        }
    }

    const formatDate = (d: string) => new Date(d).toLocaleString()

    return (
        <div className="container max-w-4xl py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">🔗 Webhook Management</h1>
                <p className="text-muted-foreground mt-1">Configure and monitor outgoing webhook endpoints for order events.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {(['endpoints', 'logs'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── ENDPOINTS TAB ── */}
            {activeTab === 'endpoints' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} configured</p>
                        <Button size="sm" onClick={() => setShowForm(s => !s)}>
                            <Plus className="h-4 w-4 mr-1" /> Add Endpoint
                        </Button>
                    </div>

                    {/* Add Endpoint Form */}
                    {showForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">New Webhook Endpoint</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddEndpoint} className="space-y-4">
                                    {formError && (
                                        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{formError}</p>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="wh-label">Label</Label>
                                            <Input id="wh-label" placeholder="e.g. ERP System" value={formLabel} onChange={e => setFormLabel(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="wh-url">Target URL</Label>
                                            <Input id="wh-url" placeholder="https://your-system.com/hook" value={formUrl} onChange={e => setFormUrl(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subscribe to Events</Label>
                                        <div className="flex gap-4 flex-wrap">
                                            {ALL_EVENTS.map(event => (
                                                <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <Checkbox
                                                        id={`event-${event}`}
                                                        checked={formEvents.includes(event)}
                                                        onCheckedChange={() => handleToggleEvent(event)}
                                                    />
                                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{event}</code>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                                        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Endpoint'}</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Endpoints List */}
                    {isLoadingEndpoints ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : endpoints.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                No endpoints configured yet. Click &ldquo;Add Endpoint&rdquo; to get started.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {endpoints.map(ep => (
                                <Card key={ep.id}>
                                    <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{ep.label}</span>
                                                <Badge variant={ep.isActive ? 'default' : 'secondary'} className="text-xs">
                                                    {ep.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{ep.url}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {ep.events.map(ev => (
                                                    <Badge key={ev} variant="outline" className="text-xs font-mono">{ev}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {/* Native toggle */}
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={ep.isActive}
                                                onClick={() => handleToggleActive(ep)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${ep.isActive ? 'bg-primary' : 'bg-muted'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${ep.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(ep.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── LOGS TAB ── */}
            {activeTab === 'logs' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Last 100 delivery attempts</p>
                        <Button size="sm" variant="outline" onClick={loadLogs} disabled={isLoadingLogs}>
                            <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingLogs ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                    </div>

                    {isLoadingLogs ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : logs.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                No delivery logs yet. Place an order to generate events.
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40">
                                                <th className="text-left px-4 py-2 font-medium">Status</th>
                                                <th className="text-left px-4 py-2 font-medium">Event</th>
                                                <th className="text-left px-4 py-2 font-medium">Endpoint</th>
                                                <th className="text-left px-4 py-2 font-medium">Code</th>
                                                <th className="text-left px-4 py-2 font-medium">Error</th>
                                                <th className="text-left px-4 py-2 font-medium">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.webhook_logs.id} className="border-b last:border-0 hover:bg-muted/20">
                                                    <td className="px-4 py-2">
                                                        {log.webhook_logs.status === 'success'
                                                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                                                            : <XCircle className="h-4 w-4 text-destructive" />
                                                        }
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{log.webhook_logs.event}</code>
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground max-w-[180px] truncate">
                                                        {log.webhook_endpoints?.label ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-2 font-mono">{log.webhook_logs.statusCode ?? '—'}</td>
                                                    <td className="px-4 py-2 text-destructive text-xs max-w-[200px] truncate">
                                                        {log.webhook_logs.errorMessage ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                                                        {formatDate(log.webhook_logs.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
