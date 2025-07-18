import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Send, 
  Instagram, 
  Facebook, 
  Music, 
  MessageSquare, 
  UtensilsCrossed,
  Ticket,
  Users,
  Heart,
  Share2,
  Calendar,
  Clock,
  Award,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function ClientPageOrkut() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [activeTab, setActiveTab] = useState("perfil");

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["/api/client", vendorId],
    enabled: !!vendorId,
  });

  const rateMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      await apiRequest(`/api/client/${vendorId}/rate`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client", vendorId] });
      setRating(0);
      setComment("");
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const trackInteraction = async (eventType: string) => {
    try {
      await apiRequest(`/api/client/${vendorId}/track`, {
        method: "POST",
        body: { eventType },
      });
    } catch (error) {
      console.error("Erro ao rastrear interação:", error);
    }
  };

  useEffect(() => {
    if (vendorId) {
      trackInteraction("qr_scan");
    }
  }, [vendorId]);

  const handleSocialClick = (platform: string, url: string) => {
    trackInteraction(`${platform}_click`);
    window.open(url, "_blank");
  };

  const handleMenuClick = (menuUrl: string) => {
    trackInteraction("menu_view");
    window.open(menuUrl, "_blank");
  };

  const handleSubmitRating = () => {
    if (rating > 0) {
      rateMutation.mutate({ rating, comment });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Página não encontrada</p>
        </div>
      </div>
    );
  }

  // Use vendor colors or defaults
  const startColor = vendor.backgroundColorStart || '#9333ea';
  const endColor = vendor.backgroundColorEnd || '#ec4899';
  
  const backgroundGradient = `linear-gradient(135deg, ${startColor}, ${endColor})`;

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${startColor}10, ${endColor}10)`
      }}
    >
      {/* Header estilo Orkut */}
      <div 
        className="text-white p-6 relative overflow-hidden"
        style={{ background: backgroundGradient }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={vendor.logoUrl} alt={vendor.businessName} />
                <AvatarFallback className="bg-white text-purple-600 text-xl font-bold">
                  {vendor.businessName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{vendor.businessName}</h1>
                <p className="text-purple-100 text-lg">{vendor.businessDescription}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Users className="h-3 w-3 mr-1" />
                    {vendor.ratingCount} avaliações
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {vendor.averageRating?.toFixed(1) || "0.0"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-white/30">
                <Heart className="h-4 w-4 mr-2" />
                Curtir
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-white/30">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation estilo Orkut */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex space-x-8">
            {["perfil", "depoimentos", "fotos", "contato"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? `text-gray-700`
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                style={activeTab === tab ? {
                  borderColor: startColor
                } : {}}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Informações */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de Informações */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" style={{ color: startColor }} />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vendor.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{vendor.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Membro desde 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Online agora</span>
                </div>
              </CardContent>
            </Card>

            {/* Card de Cupom */}
            {vendor.couponTitle && (
              <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-orange-600" />
                    Cupom Especial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white/80 p-3 rounded-lg border border-yellow-300">
                    <h4 className="font-bold text-orange-800 mb-2">{vendor.couponTitle}</h4>
                    {vendor.couponDescription && (
                      <p className="text-sm text-gray-700 mb-2">{vendor.couponDescription}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-600 font-medium">
                        {vendor.couponQuantity} disponíveis
                      </span>
                      <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Limitado
                      </Badge>
                    </div>
                    {vendor.couponConditions && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        {vendor.couponConditions}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card de Redes Sociais */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: startColor }} />
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {vendor.whatsappNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => handleSocialClick("whatsapp", `https://wa.me/${vendor.whatsappNumber.replace(/\D/g, "")}`)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {vendor.instagramHandle && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
                      onClick={() => handleSocialClick("instagram", `https://instagram.com/${vendor.instagramHandle.replace("@", "")}`)}
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                  )}
                  
                  {vendor.facebookHandle && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={() => handleSocialClick("facebook", `https://facebook.com/${vendor.facebookHandle.replace("@", "")}`)}
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                  )}
                  
                  {vendor.tiktokHandle && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                      onClick={() => handleSocialClick("tiktok", `https://tiktok.com/@${vendor.tiktokHandle.replace("@", "")}`)}
                    >
                      <Music className="h-4 w-4" />
                      TikTok
                    </Button>
                  )}
                  
                  {vendor.spotifyPlaylistUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 col-span-2"
                      onClick={() => handleSocialClick("spotify", vendor.spotifyPlaylistUrl)}
                    >
                      <Music className="h-4 w-4" />
                      Playlist no Spotify
                    </Button>
                  )}
                </div>
                
                {(vendor.menuFileUrl || vendor.menuLink) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                    onClick={() => handleMenuClick(vendor.menuFileUrl || vendor.menuLink)}
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    Ver Cardápio
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "perfil" && (
              <div className="space-y-6">
                {/* Mensagem Personalizada */}
                {vendor.customMessage && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" style={{ color: startColor }} />
                        Mensagem do Proprietário
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-gray-700 italic">"{vendor.customMessage}"</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Estatísticas */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5" style={{ color: startColor }} />
                      Estatísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {vendor.ratingCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">Avaliações</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {vendor.averageRating?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-sm text-gray-600">Estrelas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "depoimentos" && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    Deixe sua Avaliação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Sua avaliação</Label>
                    <div className="flex items-center space-x-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            star <= (hoveredStar || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Comentário (opcional)</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Conte sobre sua experiência..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitRating}
                    disabled={rating === 0 || rateMutation.isPending}
                    className="w-full text-white"
                    style={{ background: backgroundGradient }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {rateMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "fotos" && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Galeria de Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {vendor.logoUrl && (
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 flex items-center justify-center">
                        <img
                          src={vendor.logoUrl}
                          alt="Logo"
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 text-center">
                        Mais fotos em breve!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "contato" && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Entre em Contato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 mb-4">
                      Escolha a melhor forma de entrar em contato:
                    </p>
                    
                    <div className="grid gap-3">
                      {vendor.whatsappNumber && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          onClick={() => handleSocialClick("whatsapp", `https://wa.me/${vendor.whatsappNumber.replace(/\D/g, "")}`)}
                        >
                          <MessageSquare className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">WhatsApp</div>
                            <div className="text-sm text-gray-600">{vendor.whatsappNumber}</div>
                          </div>
                        </Button>
                      )}
                      
                      {vendor.instagramHandle && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="justify-start bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
                          onClick={() => handleSocialClick("instagram", `https://instagram.com/${vendor.instagramHandle.replace("@", "")}`)}
                        >
                          <Instagram className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Instagram</div>
                            <div className="text-sm text-gray-600">{vendor.instagramHandle}</div>
                          </div>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}