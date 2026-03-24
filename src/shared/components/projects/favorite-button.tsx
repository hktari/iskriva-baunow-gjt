'use client';

import { useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toggleFavorite } from '@/server/actions/projects';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  projectId: string;
  isFavorite: boolean;
}

export function FavoriteButton({ projectId, isFavorite }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleFavorite(projectId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className="h-8 w-8"
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
      />
      <span className="sr-only">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
    </Button>
  );
}
