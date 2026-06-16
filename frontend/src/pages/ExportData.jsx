import { useState } from 'react';
import { Download } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { downloadExport } from '@/lib/download';

export default function ExportData() {
  const [type, setType] = useState('all');
  const [format, setFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      await downloadExport({ type, format });
    } catch (err) {
      setError(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Respaldo</Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Exportar datos</h1>
        <p className="text-muted-foreground">Descarga eventos y compras en JSON o CSV para Excel o respaldo.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Configurar exportación</CardTitle>
          <CardDescription>Los archivos se descargan directamente a tu equipo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Qué exportar">
            <Select value={type} onChange={e => setType(e.target.value)}>
              <option value="all">Todo (eventos + compras)</option>
              <option value="events">Solo eventos</option>
              <option value="purchases">Solo compras de mercado</option>
            </Select>
          </FormField>
          <FormField label="Formato">
            <Select value={format} onChange={e => setFormat(e.target.value)}>
              <option value="json">JSON (completo)</option>
              <option value="csv">CSV (Excel)</option>
            </Select>
          </FormField>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            <Download className="size-4" /> {isExporting ? 'Exportando…' : 'Descargar archivo'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
