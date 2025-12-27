import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAvatarProps {
  userId: string;
  avatarUrl: string | null;
  fullName: string | null;
  onAvatarUpdate: (url: string) => void;
}

const AVATAR_COLORS = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
];

const ProfileAvatar = ({ userId, avatarUrl, fullName, onAvatarUpdate }: ProfileAvatarProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initials = fullName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // Generate a consistent color based on the user's name
  const colorIndex = fullName ? fullName.charCodeAt(0) % AVATAR_COLORS.length : 0;
  const gradientClass = AVATAR_COLORS[colorIndex];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateAIAvatar = async () => {
    setIsGenerating(true);
    
    try {
      toast({
        title: 'Generating Avatar',
        description: 'Creating your personalized AI avatar...',
      });

      const { data, error } = await supabase.functions.invoke('generate-avatar', {
        body: {
          initials,
          fullName,
          style: 'luxury'
        }
      });

      if (error) throw error;

      if (data?.avatarUrl) {
        // Update profile with AI-generated avatar
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.avatarUrl })
          .eq('id', userId);

        if (updateError) throw updateError;

        onAvatarUpdate(data.avatarUrl);
        toast({
          title: data.fallback ? 'Avatar Created' : 'AI Avatar Generated',
          description: data.fallback 
            ? 'Created a beautiful avatar for you.' 
            : 'Your unique AI-generated avatar is ready!',
        });
      }
    } catch (error) {
      console.error('AI avatar error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className="w-24 h-24 ring-4 ring-primary/20 ring-offset-2 ring-offset-background shadow-luxury">
        <AvatarImage src={avatarUrl || ''} className="object-cover" />
        <AvatarFallback className={`text-2xl font-display text-white bg-gradient-to-br ${gradientClass}`}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg hover:scale-105 disabled:opacity-50"
            disabled={isUploading || isGenerating}
          >
            {isUploading || isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={() => cameraInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload from Gallery
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={generateAIAvatar}
            className="cursor-pointer"
            disabled={isGenerating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Avatar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default ProfileAvatar;
