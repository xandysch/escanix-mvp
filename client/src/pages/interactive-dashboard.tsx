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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { FileUpload } from "@/components/file-upload";
import { QRGenerator } from "@/components/qr-generator";

import { 
  BarChart3, 
  QrCode, 
  MessageSquare, 
  Instagram, 
  Star, 
  Eye,
  Save,
  Menu,
  Store,
  LogOut
} from "lucide-react";

const formSchema = insertVendorSchema.extend({
  whatsappNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  spotifyPlaylistUrl: z.string().url().optional().or(z.literal("")),
  menuLink: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function InteractiveDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const { data: vendorConfig, isLoading: vendorLoading } = useQuery({
    queryKey: ["/api/vendor/config"],
    enabled: isAuthenticated,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/vendor/analytics"],
    enabled: isAuthenticated && !!vendorConfig,
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
      form.reset(vendorConfig);
    }
  }, [vendorConfig, form]);

  const mutation = useMutation({
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
      setActiveTab("dashboard");
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
    mutation.mutate(data);
  };

  if (authLoading || vendorLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const AnalyticsCard = ({ icon: Icon, title, value, color = "blue" }: {
    icon: any;
    title: string;
    value: number | string;
    color?: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-${color}-50`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PouchPages</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user?.firstName} {user?.lastName}</span>
                  <Badge variant="secondary" className="text-xs">agora</Badge>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="text-center">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="personalizar">
              Personalizar
            </TabsTrigger>
            <TabsTrigger value="visualizar">
              Visualizar
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {vendorConfig ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnalyticsCard
                    icon={QrCode}
                    title="QR Escaneados"
                    value={analytics?.qrScans || 0}
                    color="blue"
                  />
                  
                  <AnalyticsCard
                    icon={Star}
                    title="Avaliações"
                    value={analytics?.averageRating || "0.0"}
                    color="green"
                  />
                  
                  <AnalyticsCard
                    icon={MessageSquare}
                    title="Clicks WhatsApp"
                    value={analytics?.whatsappClicks || 0}
                    color="green"
                  />
                  
                  <AnalyticsCard
                    icon={Instagram}
                    title="Clicks Instagram"
                    value={analytics?.instagramClicks || 0}
                    color="pink"
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <QrCode className="h-5 w-5" />
                      <span>Gerar QR Code</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QRGenerator vendorId={vendorConfig.id} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Configure sua página primeiro
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Para acessar o dashboard, você precisa configurar suas informações.
                  </p>
                  <Button onClick={() => setActiveTab("personalizar")}>
                    Configurar Agora
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Personalizar Tab */}
          <TabsContent value="personalizar">
            <Card>
              <CardHeader>
                <CardTitle>Personalize sua Página</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="businessName">Nome do Negócio *</Label>
                      <Input
                        id="businessName"
                        {...form.register("businessName")}
                        placeholder="Ex: Açaí do João"
                      />
                      {form.formState.errors.businessName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.businessName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="businessDescription">Descrição</Label>
                      <Textarea
                        id="businessDescription"
                        {...form.register("businessDescription")}
                        placeholder="Descreva seu negócio..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Logo</Label>
                      <FileUpload
                        accept="image/*"
                        onUpload={(url) => form.setValue("logoUrl", url)}
                        uploadUrl="/api/upload/logo"
                        currentFile={form.watch("logoUrl")}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        {...form.register("address")}
                        placeholder="Rua, número, bairro, cidade"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="whatsappNumber">WhatsApp</Label>
                        <Input
                          id="whatsappNumber"
                          {...form.register("whatsappNumber")}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div>
                        <Label htmlFor="instagramHandle">Instagram</Label>
                        <Input
                          id="instagramHandle"
                          {...form.register("instagramHandle")}
                          placeholder="@seuinstagram"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="spotifyPlaylistUrl">Link Spotify</Label>
                      <Input
                        id="spotifyPlaylistUrl"
                        {...form.register("spotifyPlaylistUrl")}
                        placeholder="https://open.spotify.com/playlist/..."
                      />
                    </div>

                    <div>
                      <Label>Menu (arquivo)</Label>
                      <FileUpload
                        accept=".pdf,image/*"
                        onUpload={(url) => form.setValue("menuFileUrl", url)}
                        uploadUrl="/api/upload/menu"
                        currentFile={form.watch("menuFileUrl")}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="menuLink">ou Link do Menu</Label>
                      <Input
                        id="menuLink"
                        {...form.register("menuLink")}
                        placeholder="https://seusite.com/menu"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customMessage">Mensagem Personalizada</Label>
                      <Textarea
                        id="customMessage"
                        {...form.register("customMessage")}
                        placeholder="Mensagem especial para seus clientes..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={mutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {mutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visualizar Tab */}
          <TabsContent value="visualizar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Prévia da sua Página</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vendorConfig ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Veja como seus clientes verão sua página:
                    </p>
                    <Button asChild>
                      <a 
                        href={`/client/${vendorConfig.id}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Abrir Prévia
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Configure sua página primeiro para ver a prévia.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}