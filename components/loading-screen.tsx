import { Loader } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center mt-20">
        <span className="text-xs text-muted-foreground">Loading...</span>
        <Loader className="animate-spin w-8 h-8" />
      </div>
    </div>
  );
}
