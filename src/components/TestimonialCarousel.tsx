
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Event Organizer",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    quote: "The 3D venue exploration tool has completely transformed how we plan our events. Clients can now see exactly how their event will look before making any decisions.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Concert Promoter",
    image: "https://randomuser.me/api/portraits/men/36.jpg",
    quote: "The real-time ticket sales and entry tracking features give us unprecedented insights into our audience. It's made managing large-scale concerts so much more efficient.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Attendee",
    image: "https://randomuser.me/api/portraits/women/43.jpg",
    quote: "Being able to virtually explore the venue and select my seat in 3D before purchasing tickets has been a game-changer. I always know exactly what my view will be like.",
  },
  {
    id: 4,
    name: "David Kim",
    role: "Conference Director",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    quote: "The analytics dashboard provides valuable insights that help us improve our events year after year. We can see what works and what doesn't in real-time.",
  },
  {
    id: 5,
    name: "Olivia Thompson",
    role: "Marketing Manager",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    quote: "The platform's ability to create immersive 3D previews of our events has dramatically increased our ticket sales. Potential attendees get excited when they can visualize the experience.",
  },
];

const TestimonialCarousel = () => {
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className={cn("w-full max-w-5xl mx-auto", mounted ? "animate-fade-in" : "opacity-0")}>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 p-2">
              <div className="h-full">
                <Card className="h-full bg-background/70 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div>
                      <div className="mb-4 text-4xl font-serif text-primary">"</div>
                      <p className="text-muted-foreground mb-6 italic">
                        {testimonial.quote}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3 border-2 border-primary/20">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                current === index ? "bg-primary w-4" : "bg-muted"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <CarouselPrevious className="hidden sm:flex -left-12" />
        <CarouselNext className="hidden sm:flex -right-12" />
      </Carousel>
    </div>
  );
};

export default TestimonialCarousel;
