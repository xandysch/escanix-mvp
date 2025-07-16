import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Star } from "lucide-react";

interface RatingSystemProps {
  vendorId: number;
  onSubmit: (rating: number, comment?: string) => void;
  onCancel: () => void;
}

export function RatingSystem({ vendorId, onSubmit, onCancel }: RatingSystemProps) {
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitRatingMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      const response = await apiRequest("POST", `/api/client/${vendorId}/rate`, data);
      return response.json();
    },
    onSuccess: () => {
      onSubmit(selectedRating, comment);
      queryClient.invalidateQueries({ queryKey: ["/api/client", vendorId.toString()] });
    },
    onError: (error) => {
      if (error.message.includes("once per day")) {
        toast({
          title: "Avaliação já enviada",
          description: "Você já avaliou este negócio hoje.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao enviar avaliação. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = () => {
    if (selectedRating === 0) {
      toast({
        title: "Selecione uma avaliação",
        description: "Por favor, selecione o número de estrelas.",
        variant: "destructive",
      });
      return;
    }

    submitRatingMutation.mutate({
      rating: selectedRating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Star Rating */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Sua avaliação
        </Label>
        <div className="flex justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setSelectedRating(star)}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || selectedRating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {selectedRating > 0 && (
          <p className="text-center text-sm text-gray-600 mt-2">
            {selectedRating === 1 && "Muito insatisfeito"}
            {selectedRating === 2 && "Insatisfeito"}
            {selectedRating === 3 && "Neutro"}
            {selectedRating === 4 && "Satisfeito"}
            {selectedRating === 5 && "Muito satisfeito"}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="comment" className="text-sm font-medium text-gray-700 mb-2 block">
          Comentário (opcional)
        </Label>
        <Textarea
          id="comment"
          placeholder="Conte-nos sobre sua experiência..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 caracteres
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={submitRatingMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          disabled={submitRatingMutation.isPending}
        >
          {submitRatingMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
        </Button>
      </div>
    </div>
  );
}
