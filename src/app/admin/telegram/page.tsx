'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface TelegramAccount {
  id: string;
  apiId: number;
  apiHash: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

export default function TelegramSettingsPage() {
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    apiId: '',
    apiHash: '',
    phoneNumber: '',
    code: '',
    phoneCodeHash: '',
    session: '',
  });

  const [step, setStep] = useState<'initial' | 'code' | 'session'>('initial');

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await fetch('/api/telegram/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load Telegram accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleInitialSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/telegram/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiId: formData.apiId,
          apiHash: formData.apiHash,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      if (data.needsCode) {
        setFormData(prev => ({ ...prev, phoneCodeHash: data.phoneCodeHash }));
        setStep('code');
        toast({
          title: 'Code Sent',
          description: 'Verification code sent to your Telegram app',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send code',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/telegram/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiId: formData.apiId,
          apiHash: formData.apiHash,
          phoneNumber: formData.phoneNumber,
          code: formData.code,
          phoneCodeHash: formData.phoneCodeHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      if (data.needsPassword) {
        toast({
          title: '2FA Required',
          description: 'Two-factor authentication is enabled. Please disable it temporarily to add this account.',
          variant: 'destructive',
        });
        setShowAddForm(false);
        setStep('initial');
        setFormData({
          apiId: '',
          apiHash: '',
          phoneNumber: '',
          code: '',
          phoneCodeHash: '',
          session: '',
        });
        return;
      }

      if (data.session) {
        setFormData(prev => ({ ...prev, session: data.session }));
        setStep('session');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify code',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSessionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/telegram/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiId: parseInt(formData.apiId),
          apiHash: formData.apiHash,
          phoneNumber: formData.phoneNumber,
          session: formData.session,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save account');
      }

      toast({
        title: 'Success',
        description: 'Telegram account added successfully',
      });
      setShowAddForm(false);
      setStep('initial');
      setFormData({
        apiId: '',
        apiHash: '',
        phoneNumber: '',
        code: '',
        phoneCodeHash: '',
        session: '',
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save account',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleAccount(id: string, isActive: boolean) {
    try {
      const response = await fetch('/api/telegram/accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      });

      if (!response.ok) throw new Error('Failed to update account');

      setAccounts(prev =>
        prev.map(acc => (acc.id === id ? { ...acc, isActive } : acc))
      );

      toast({
        title: isActive ? 'Account Activated' : 'Account Deactivated',
        description: isActive ? 'The account is now active and will be used for image uploads' : 'The account is now inactive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update account status',
        variant: 'destructive',
      });
    }
  }

  async function deleteAccount(id: string) {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const response = await fetch(`/api/telegram/accounts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      setAccounts(prev => prev.filter(acc => acc.id !== id));
      toast({
        title: 'Deleted',
        description: 'Account deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Telegram Settings</h1>
          <p className="text-muted-foreground">Manage Telegram accounts for image storage</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Telegram Account</CardTitle>
            <CardDescription>
              {step === 'initial' && 'Enter your Telegram API credentials and phone number'}
              {step === 'code' && 'Enter the verification code sent to your Telegram app'}
              {step === 'session' && 'Confirm to save the account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'initial' && (
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiId">API ID</Label>
                    <Input
                      id="apiId"
                      type="number"
                      value={formData.apiId}
                      onChange={e => setFormData(prev => ({ ...prev, apiId: e.target.value }))}
                      placeholder="12345678"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiHash">API Hash</Label>
                    <Input
                      id="apiHash"
                      type="text"
                      value={formData.apiHash}
                      onChange={e => setFormData(prev => ({ ...prev, apiHash: e.target.value }))}
                      placeholder="Your API Hash"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+1234567890"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Include country code (e.g., +1 for USA)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Code'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} type="button">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="12345"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setStep('initial')} type="button">
                    Back
                  </Button>
                </div>
              </form>
            )}

            {step === 'session' && (
              <form onSubmit={handleSessionSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your Telegram account has been verified. Click Save to store the account.
                </p>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Account'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setStep('initial')} type="button">
                    Back
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No Telegram accounts configured</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add an account to start using Telegram for image storage
              </p>
            </CardContent>
          </Card>
        ) : (
          accounts.map(account => (
            <Card key={account.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {account.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{account.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        API ID: {account.apiId} • Added {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={account.isActive}
                        onCheckedChange={checked => toggleAccount(account.id, checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAccount(account.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
