import { Loader } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">Loading...</span>
      <Loader className="animate-spin w-8 h-8" />
    </div>
  );
}
