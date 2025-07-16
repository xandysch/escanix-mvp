import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { RatingSystem } from "@/components/rating-system";
import { Store, MessageSquare, Share2, MapPin, Star, ExternalLink } from "lucide-react";

export default function ClientPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { toast } = useToast();
  const [showRating, setShowRating] = useState(false);

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ["/api/client", vendorId],
    enabled: !!vendorId,
  });

  const handleRatingSubmit = (rating: number, comment?: string) => {
    // Rating submission is handled by the RatingSystem component
    setShowRating(false);
    toast({
      title: "Avaliação Enviada",
      description: "Obrigado pelo seu feedback!",
    });
  };

  const openWhatsApp = () => {
    if (vendor?.whatsappNumber) {
      const cleanNumber = vendor.whatsappNumber.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá! Vi sua página no Escanix e gostaria de saber mais sobre ${vendor.businessName}.`);
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    }
  };

  const openInstagram = () => {
    if (vendor?.instagramHandle) {
      const handle = vendor.instagramHandle.replace('@', '');
      window.open(`https://instagram.com/${handle}`, '_blank');
    }
  };

  const openSpotify = () => {
    if (vendor?.spotifyPlaylistUrl) {
      window.open(vendor.spotifyPlaylistUrl, '_blank');
    }
  };

  const openMaps = () => {
    if (vendor?.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(vendor.address)}`, '_blank');
    }
  };

  const openMenu = () => {
    if (vendor?.menuFileUrl) {
      window.open(vendor.menuFileUrl, '_blank');
    } else if (vendor?.menuLink) {
      window.open(vendor.menuLink, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-6">
            <div className="text-center">
              <Skeleton className="w-20 h-20 mx-auto mb-4 rounded-xl" />
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto mb-3" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
            <p className="text-gray-600 mb-4">
              Este negócio não foi encontrado ou não está mais ativo.
            </p>
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Powered by <span className="font-semibold text-purple-500">Escanix</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      
      {/* Header with Business Info */}
      <header className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            {/* Business Logo */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-100">
              {vendor.logoUrl ? (
                <img 
                  src={vendor.logoUrl} 
                  alt={`Logo ${vendor.businessName}`}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100">
                  <Store className="w-8 h-8 text-purple-600" />
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {vendor.businessName}
            </h1>
            {vendor.businessDescription && (
              <p className="text-gray-600 text-sm mb-3">
                {vendor.businessDescription}
              </p>
            )}
            
            {/* Rating Display */}
            <div className="flex justify-center items-center">
              {[1,2,3,4,5].map((star) => (
                <Star 
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(vendor.averageRating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {vendor.averageRating ? vendor.averageRating.toFixed(1) : '0.0'} ({vendor.ratingCount || 0} avaliações)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Custom Message */}
        {vendor.customMessage && (
          <Card className="border-gray-100">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {vendor.customMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* WhatsApp Contact */}
          {vendor.whatsappNumber && (
            <Button
              onClick={openWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 h-auto flex-col space-y-2"
            >
              <div className="text-2xl">📱</div>
              <span className="text-sm font-medium">Falar no WhatsApp</span>
            </Button>
          )}

          {/* Menu */}
          {(vendor.menuFileUrl || vendor.menuLink) && (
            <Button
              onClick={openMenu}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-4 h-auto flex-col space-y-2"
            >
              <div className="text-2xl">🍹</div>
              <span className="text-sm font-medium">Ver Cardápio</span>
            </Button>
          )}
        </div>

        {/* Social Media Links */}
        {(vendor.instagramHandle || vendor.spotifyPlaylistUrl) && (
          <Card className="border-gray-100">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Share2 className="w-5 h-5 text-purple-500 mr-2" />
                Redes Sociais
              </h3>
              
              <div className="space-y-3">
                {/* Instagram */}
                {vendor.instagramHandle && (
                  <Button
                    onClick={openInstagram}
                    className="w-full justify-between p-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg h-auto"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📷</span>
                      <span className="font-medium">Instagram</span>
                    </div>
                    <span className="text-sm opacity-90">{vendor.instagramHandle}</span>
                  </Button>
                )}

                {/* Spotify */}
                {vendor.spotifyPlaylistUrl && (
                  <Button
                    onClick={openSpotify}
                    className="w-full justify-between p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg h-auto"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🎵</span>
                      <span className="font-medium">Playlist do Ambiente</span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-75" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address */}
        {vendor.address && (
          <Card className="border-gray-100">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 text-red-500 mr-2" />
                Localização
              </h3>
              
              <Button
                onClick={openMaps}
                variant="ghost"
                className="w-full justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg h-auto"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900">{vendor.address}</p>
                  <p className="text-sm text-gray-500">Toque para abrir no mapa</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Rating Section */}
        <Card className="border-gray-100">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Avalie sua Experiência
            </h3>
            
            {!showRating ? (
              <div className="text-center">
                <Button
                  onClick={() => setShowRating(true)}
                  variant="outline"
                  className="w-full"
                >
                  Deixar uma avaliação
                </Button>
              </div>
            ) : (
              <RatingSystem
                vendorId={parseInt(vendorId!)}
                onSubmit={handleRatingSubmit}
                onCancel={() => setShowRating(false)}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto px-4 py-6 text-center">
        <p className="text-xs text-gray-500">
          Powered by <span className="font-semibold text-purple-500">Escanix</span>
        </p>
      </footer>
    </div>
  );
}
