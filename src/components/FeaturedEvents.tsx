
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - would come from Supabase in a real implementation
const events = [
  {
    id: 1,
    title: "Tech Innovation Summit",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "Nov 15, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "Digital Conference Center",
    category: "Conference",
    featured: true,
  },
  {
    id: 2,
    title: "Annual Music Festival",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "Dec 10-12, 2023",
    time: "All Day",
    location: "Riverside Amphitheater",
    category: "Music",
    featured: true,
  },
  {
    id: 3,
    title: "Global Sports Championship",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "Jan 22, 2024",
    time: "7:30 PM",
    location: "Metropolitan Arena",
    category: "Sports",
    featured: true,
  },
  {
    id: 4,
    title: "International Film Premiere",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "Feb 5, 2024",
    time: "8:00 PM",
    location: "Grand Cinema Hall",
    category: "Entertainment",
    featured: true,
  },
];

const FeaturedEvents = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMounted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-[16/9] bg-muted animate-pulse" />
            <CardContent className="p-4">
              <div className="h-6 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {events.map((event, index) => (
        <Card 
          key={event.id} 
          className={cn(
            "overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300",
            mounted && "animate-fade-in"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="aspect-[16/9] relative overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <Badge 
              className="absolute top-3 left-3 z-10"
              variant={event.category === "Conference" ? "default" : 
                    event.category === "Music" ? "secondary" : 
                    event.category === "Sports" ? "outline" : "destructive"}
            >
              {event.category}
            </Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-4 pb-4 pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link to={`/events/${event.id}`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FeaturedEvents;
