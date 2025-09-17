import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Eye, Download, Lock } from 'lucide-react';

interface SharedDoc {
  id: string;
  document_name: string;
  document_type: string;
  created_at: string;
  signed_url: string;
}

export default function Share() {
  const { uid } = useParams();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<SharedDoc[] | null>(null);

  const unlock = async () => {
    if (!uid) return;
    if (!pin || pin.length < 4) {
      toast.error('Enter your 4-digit PIN');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-docs', {
        body: { uid, pin },
      });
      if (error) throw error;
      setDocs(data?.documents || []);
      if (!data?.documents?.length) {
        toast.info('No documents found');
      } else {
        toast.success('Unlocked');
      }
    } catch (e) {
      console.error(e);
      toast.error('Invalid PIN or unable to load documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-2xl p-6">
      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Secure Document Access</CardTitle>
          <CardDescription>Enter your secret PIN to view and download documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 4-digit PIN"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <Button onClick={unlock} disabled={loading || pin.length < 4} className="mt-2 w-full">
              {loading ? 'Unlocking…' : 'Unlock Documents'}
            </Button>
          </div>

          {docs && (
            <div className="space-y-3">
              {docs.length === 0 ? (
                <p className="text-muted-foreground">No documents to show.</p>
              ) : (
                docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-card-glass/30 rounded-xl border border-border/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{d.document_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{d.document_type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => window.open(d.signed_url, '_blank')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const a = document.createElement('a');
                        a.href = d.signed_url;
                        a.download = d.document_name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
