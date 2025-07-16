import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { QrCode, Download, RefreshCw, ExternalLink, Copy } from "lucide-react";

interface QRGeneratorProps {
  vendorId?: number;
}

export function QRGenerator({ vendorId }: QRGeneratorProps) {
  const { toast } = useToast();
  const [qrData, setQrData] = useState<{ qrCode: string; url: string } | null>(null);

  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/vendor/generate-qr", {});
      return response.json();
    },
    onSuccess: (data) => {
      setQrData(data);
      toast({
        title: "QR Code Gerado",
        description: "Seu QR Code foi criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao gerar QR Code. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const downloadQR = () => {
    if (qrData?.qrCode) {
      const link = document.createElement('a');
      link.download = 'qr-code-escanix.png';
      link.href = qrData.qrCode;
      link.click();
    }
  };

  const copyUrl = async () => {
    if (qrData?.url) {
      try {
        await navigator.clipboard.writeText(qrData.url);
        toast({
          title: "URL Copiada",
          description: "Link da sua página foi copiado para a área de transferência.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao copiar URL.",
          variant: "destructive",
        });
      }
    }
  };

  const openClientPage = () => {
    if (qrData?.url) {
      window.open(qrData.url, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="w-5 h-5 text-purple-600 mr-2" />
          Código QR
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="text-center space-y-4">
          {/* QR Code Display */}
          <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            {generateQRMutation.isPending ? (
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-500">Gerando QR Code...</p>
              </div>
            ) : qrData?.qrCode ? (
              <img 
                src={qrData.qrCode} 
                alt="QR Code" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <QrCode className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code será gerado aqui</p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={() => generateQRMutation.mutate()}
              disabled={generateQRMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateQRMutation.isPending ? 'animate-spin' : ''}`} />
              {qrData ? 'Gerar Novo QR Code' : 'Gerar QR Code'}
            </Button>

            {qrData && (
              <>
                <Button 
                  onClick={downloadQR}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar QR Code
                </Button>

                {/* URL Display and Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Link da Página:</span>
                      <Badge variant="secondary" className="text-xs">
                        Público
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 text-left">
                      <p className="text-xs text-gray-600 break-all font-mono">
                        {qrData.url}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={copyUrl}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </Button>
                      <Button 
                        onClick={openClientPage}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="text-left bg-blue-50 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Como usar:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Gere e baixe seu QR Code personalizado</li>
              <li>• Imprima e cole em seus produtos ou estabelecimento</li>
              <li>• Clientes escaneiam e acessam sua página</li>
              <li>• Compartilhe o link diretamente nas redes sociais</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
