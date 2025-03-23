
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading experience" }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 10;
        return next > 100 ? 100 : next;
      });
    }, 200);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-8 max-w-md px-8">
        <div className="flex flex-col items-center">
          <div className="relative h-24 w-24 mb-6">
            <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-primary opacity-30"></div>
            <div 
              className="absolute inset-0 rounded-full border-b-2 border-primary"
              style={{ 
                clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)`,
                transition: "clip-path 0.3s ease-out"
              }}
            ></div>
          </div>
          <h2 className="font-sans text-2xl tracking-tight">Smart Event Scape</h2>
          <p className="mt-2 text-sm text-muted-foreground font-mono">{message}{dots}</p>
        </div>
        
        <div className="w-full space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-end">
            <p className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
