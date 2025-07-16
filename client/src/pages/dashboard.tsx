import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVendorSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { FileUpload } from "@/components/file-upload";
import { QRGenerator } from "@/components/qr-generator";

import { Store, Share2, Menu, MessageSquare, QrCode, Eye, Save } from "lucide-react";

const formSchema = insertVendorSchema.extend({
  whatsappNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  spotifyPlaylistUrl: z.string().url().optional().or(z.literal("")),
  menuLink: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [previewMode, setPreviewMode] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Não Autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: vendorConfig, isLoading } = useQuery({
    queryKey: ["/api/vendor/config"],
    enabled: isAuthenticated,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessDescription: "",
      logoUrl: "",
      address: "",
      whatsappNumber: "",
      instagramHandle: "",
      spotifyPlaylistUrl: "",
      menuFileUrl: "",
      menuLink: "",
      customMessage: "",
    },
  });

  // Update form when vendor config loads
  useEffect(() => {
    if (vendorConfig) {
      form.reset({
        businessName: vendorConfig.businessName || "",
        businessDescription: vendorConfig.businessDescription || "",
        logoUrl: vendorConfig.logoUrl || "",
        address: vendorConfig.address || "",
        whatsappNumber: vendorConfig.whatsappNumber || "",
        instagramHandle: vendorConfig.instagramHandle || "",
        spotifyPlaylistUrl: vendorConfig.spotifyPlaylistUrl || "",
        menuFileUrl: vendorConfig.menuFileUrl || "",
        menuLink: vendorConfig.menuLink || "",
        customMessage: vendorConfig.customMessage || "",
      });
    }
  }, [vendorConfig, form]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/vendor/config", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuração Salva",
        description: "Sua página foi atualizada com sucesso! Agora você pode gerar seu QR Code.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/config"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não Autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    saveConfigMutation.mutate(data);
  };

  const handleLogoUpload = (url: string) => {
    form.setValue("logoUrl", url);
  };

  const handleMenuUpload = (url: string) => {
    form.setValue("menuFileUrl", url);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-48 w-48 mx-auto" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (previewMode && vendorConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setPreviewMode(false)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Voltar ao Dashboard
          </Button>
        </div>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          {/* Header with Business Info */}
          <header className="bg-white shadow-sm">
            <div className="max-w-md mx-auto px-4 py-6">
              <div className="text-center">
                {/* Business Logo */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-100">
                  {vendorConfig.logoUrl ? (
                    <img 
                      src={vendorConfig.logoUrl} 
                      alt={`Logo ${vendorConfig.businessName}`}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-100">
                      <Store className="w-8 h-8 text-purple-600" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {vendorConfig.businessName || "Seu Negócio"}
                </h1>
                <p className="text-gray-600 text-sm">
                  {vendorConfig.businessDescription || "Descrição do seu negócio"}
                </p>
                
                {/* Rating Display */}
                <div className="flex justify-center items-center mt-3">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className="text-yellow-400 text-sm">★</span>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">5.0 (Demo)</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-md mx-auto px-4 py-6 space-y-6">
            
            {/* Custom Message */}
            {vendorConfig.customMessage && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {vendorConfig.customMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* WhatsApp Contact */}
              {vendorConfig.whatsappNumber && (
                <a 
                  href={`https://wa.me/${vendorConfig.whatsappNumber.replace(/\D/g, '')}`}
                  className="bg-green-500 text-white rounded-xl p-4 text-center hover:bg-green-600 transition-colors"
                >
                  <div className="text-2xl mb-2">📱</div>
                  <p className="text-sm font-medium">Falar no WhatsApp</p>
                </a>
              )}

              {/* Menu */}
              {(vendorConfig.menuFileUrl || vendorConfig.menuLink) && (
                <button className="bg-purple-500 text-white rounded-xl p-4 text-center hover:bg-purple-600 transition-colors">
                  <Menu className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Ver Cardápio</p>
                </button>
              )}
            </div>

            {/* Social Media Links */}
            {(vendorConfig.instagramHandle || vendorConfig.spotifyPlaylistUrl) && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Share2 className="w-5 h-5 text-purple-500 mr-2" />
                  Redes Sociais
                </h3>
                
                <div className="space-y-3">
                  {/* Instagram */}
                  {vendorConfig.instagramHandle && (
                    <a 
                      href={`https://instagram.com/${vendorConfig.instagramHandle.replace('@', '')}`}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📷</span>
                        <span className="font-medium">Instagram</span>
                      </div>
                      <span className="text-sm opacity-90">{vendorConfig.instagramHandle}</span>
                    </a>
                  )}

                  {/* Spotify */}
                  {vendorConfig.spotifyPlaylistUrl && (
                    <a 
                      href={vendorConfig.spotifyPlaylistUrl}
                      className="flex items-center justify-between p-3 bg-green-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🎵</span>
                        <span className="font-medium">Playlist do Ambiente</span>
                      </div>
                      <span className="text-sm opacity-75">🔗</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Address */}
            {vendorConfig.address && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-red-500 mr-2">📍</span>
                  Localização
                </h3>
                
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(vendorConfig.address)}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{vendorConfig.address}</p>
                    <p className="text-sm text-gray-500">Toque para abrir no mapa</p>
                  </div>
                  <span className="text-gray-400">🔗</span>
                </a>
              </div>
            )}

            {/* Rating Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-yellow-500 mr-2">⭐</span>
                Avalie sua Experiência
              </h3>
              
              <div className="text-center">
                <div className="flex justify-center space-x-2 mb-3">
                  {[1,2,3,4,5].map((star) => (
                    <button 
                      key={star}
                      className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Toque nas estrelas para avaliar</p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="max-w-md mx-auto px-4 py-6 text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-purple-500">Escanix</span>
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Escanix</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || user?.email || "Usuário"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel de Customização</h2>
          <p className="text-gray-600">Configure sua mini-página personalizada para clientes</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Configuration Panel */}
            <div className="space-y-6">
              
              {/* Business Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="w-5 h-5 text-purple-600 mr-2" />
                    Informações do Negócio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Logo Upload */}
                  <div>
                    <Label htmlFor="logo">Logo do Negócio</Label>
                    <FileUpload
                      accept="image/*"
                      onUpload={handleLogoUpload}
                      uploadUrl="/api/upload/logo"
                      currentFile={form.watch("logoUrl")}
                    />
                  </div>

                  {/* Business Name */}
                  <div>
                    <Label htmlFor="businessName">Nome do Negócio *</Label>
                    <Input
                      id="businessName"
                      placeholder="Ex: Suco Natural da Vila"
                      {...form.register("businessName")}
                    />
                    {form.formState.errors.businessName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.businessName.message}
                      </p>
                    )}
                  </div>

                  {/* Business Description */}
                  <div>
                    <Label htmlFor="businessDescription">Descrição</Label>
                    <Textarea
                      id="businessDescription"
                      placeholder="Ex: Sucos naturais frescos e saborosos, feitos na hora com frutas selecionadas"
                      rows={3}
                      {...form.register("businessDescription")}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      placeholder="Ex: Rua das Flores, 123 - Centro"
                      {...form.register("address")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Social Media Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="w-5 h-5 text-purple-600 mr-2" />
                    Contato e Redes Sociais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* WhatsApp */}
                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp</Label>
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder="Ex: 5511999999999"
                      {...form.register("whatsappNumber")}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: código do país + DDD + número (ex: 5511999999999)
                    </p>
                  </div>

                  {/* Instagram */}
                  <div>
                    <Label htmlFor="instagramHandle">Instagram</Label>
                    <Input
                      id="instagramHandle"
                      placeholder="Ex: @suco_natural_vila"
                      {...form.register("instagramHandle")}
                    />
                  </div>

                  {/* Spotify Playlist */}
                  <div>
                    <Label htmlFor="spotifyPlaylistUrl">Playlist Spotify</Label>
                    <Input
                      id="spotifyPlaylistUrl"
                      type="url"
                      placeholder="Ex: https://open.spotify.com/playlist/..."
                      {...form.register("spotifyPlaylistUrl")}
                    />
                    {form.formState.errors.spotifyPlaylistUrl && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.spotifyPlaylistUrl.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Menu Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Menu className="w-5 h-5 text-purple-600 mr-2" />
                    Cardápio de Bebidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* Menu Upload */}
                  <div>
                    <Label>Upload do Cardápio</Label>
                    <FileUpload
                      accept=".pdf,image/*"
                      onUpload={handleMenuUpload}
                      uploadUrl="/api/upload/menu"
                      currentFile={form.watch("menuFileUrl")}
                    />
                  </div>

                  <div className="text-center text-sm text-gray-500">ou</div>

                  {/* Menu Link */}
                  <div>
                    <Label htmlFor="menuLink">Link do Cardápio</Label>
                    <Input
                      id="menuLink"
                      type="url"
                      placeholder="Ex: https://example.com/cardapio"
                      {...form.register("menuLink")}
                    />
                    {form.formState.errors.menuLink && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.menuLink.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Message Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                    Mensagem Personalizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ex: Bem-vindo! Aproveite nossos sucos frescos e naturais..."
                    rows={4}
                    {...form.register("customMessage")}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Preview & QR Code Panel */}
            <div className="space-y-6">
              
              {/* QR Code Generation */}
              <QRGenerator vendorId={vendorConfig?.id} />

              {/* Live Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 text-purple-600 mr-2" />
                    Pré-visualização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  
                  {/* Mobile Frame Preview */}
                  <div className="bg-gray-900 rounded-2xl p-2 max-w-sm mx-auto">
                    <div className="bg-white rounded-xl overflow-hidden h-96 p-4">
                      {/* Mini preview */}
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden bg-gray-100">
                          {form.watch("logoUrl") ? (
                            <img 
                              src={form.watch("logoUrl")} 
                              alt="Logo"
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-100">
                              <Store className="w-6 h-6 text-purple-600" />
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-sm font-bold text-gray-900 mb-1">
                          {form.watch("businessName") || "Nome do Negócio"}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {form.watch("businessDescription") || "Descrição do negócio"}
                        </p>
                        
                        <div className="text-xs text-gray-500 mb-3">⭐⭐⭐⭐⭐ 5.0</div>
                        
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {form.watch("whatsappNumber") && (
                            <div className="bg-green-500 text-white rounded px-2 py-1 text-xs">
                              WhatsApp
                            </div>
                          )}
                          {(form.watch("menuFileUrl") || form.watch("menuLink")) && (
                            <div className="bg-purple-500 text-white rounded px-2 py-1 text-xs">
                              Cardápio
                            </div>
                          )}
                        </div>
                        
                        {form.watch("customMessage") && (
                          <div className="bg-blue-50 rounded p-2 mb-2">
                            <p className="text-xs text-gray-700 truncate">
                              {form.watch("customMessage")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setPreviewMode(true)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Ver página completa →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button 
                type="submit"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={saveConfigMutation.isPending}
              >
                <Save className="w-5 h-5 mr-2" />
                {saveConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
