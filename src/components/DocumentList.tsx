import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  verification_status: string;
  created_at: string;
}

interface DocumentListProps {
  documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-success/10 text-success border-success/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      aadhaar: 'Aadhaar Card',
      pan_card: 'PAN Card',
      voter_id: 'Voter ID',
      driving_license: 'Driving License',
      passport: 'Passport',
      birth_certificate: 'Birth Certificate',
      income_certificate: 'Income Certificate',
      caste_certificate: 'Caste Certificate',
      domicile_certificate: 'Domicile Certificate',
      other: 'Other'
    };
    return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleView = async (document: Document) => {
    try {
      if (!document.file_url) {
        toast.error('Document URL not available');
        return;
      }
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_url, 60 * 10);
      if (error || !data?.signedUrl) {
        throw error || new Error('No signed URL');
      }
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error('Failed to open document');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      if (!document.file_url) {
        toast.error('Document URL not available');
        return;
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_url, 60 * 10, { download: document.document_name });

      if (error || !data?.signedUrl) {
        throw error || new Error('No signed URL');
      }

      const link = window.document.createElement('a');
      link.href = data.signedUrl;
      link.download = document.document_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  if (documents.length === 0) {
    return (
      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>No documents uploaded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground">Upload your first document using the form above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-3d border-0">
      <CardHeader>
        <CardTitle>Your Documents</CardTitle>
        <CardDescription>
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="p-4 bg-card-glass/30 rounded-xl border border-border/10 hover:border-border/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-lg truncate">{doc.document_name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="capitalize">
                        {getDocumentTypeLabel(doc.document_type)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={getStatusColor(doc.verification_status)}>
                    {getStatusIcon(doc.verification_status)}
                    <span className="ml-1 capitalize">{doc.verification_status}</span>
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(doc)}
                      className="hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}