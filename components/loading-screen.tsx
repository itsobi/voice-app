import { Loader } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-1">
      <span className="text-xs text-muted-foreground">Loading...</span>
      <Loader className="animate-spin" />
    </div>
  );
}
