import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, LogIn } from "lucide-react";
import escanixLogo from "@assets/escanix_favicon128_from_sharp_1752916285807.png";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src={escanixLogo} 
              alt="Escanix Logo" 
              className="w-12 h-12"
            />
            <CardTitle className="text-2xl font-bold text-gray-900">Escanix</CardTitle>
          </div>
          <p className="text-gray-600">
            Faça login para acessar sua conta de vendedor
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email/Password Login Form (Currently Disabled) */}
          <div className="space-y-4 opacity-50">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu-email@exemplo.com"
                disabled
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled
                className="mt-1"
              />
            </div>
            
            <Button disabled className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar com Email
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            Login com email/senha estará disponível em breve
          </div>
          
          <Separator />
          
          {/* Replit Auth */}
          <div className="space-y-3">
            <Button 
              onClick={handleReplitLogin}
              variant="outline"
              className="w-full border-purple-200 hover:bg-purple-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-1 4v4H7v2h4v4h2v-4h4v-2h-4V6h-2z"/>
              </svg>
              Continuar com Replit
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Você será redirecionado para o Replit para fazer login com segurança.
              O processo de autorização pode aparecer em inglês.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}