
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, MapPin, Users, Ticket } from "lucide-react";
import HeroScene from "@/components/HeroScene";
import FeaturedEvents from "@/components/FeaturedEvents";
import TestimonialCarousel from "@/components/TestimonialCarousel";

const HomePage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation sequence
  useEffect(() => {
    if (!mounted) return;
    
    const elements = [
      document.getElementById("hero-title"),
      document.getElementById("hero-subtitle"),
      document.getElementById("hero-cta"),
      document.getElementById("features-section"),
    ];

    elements.forEach((el, index) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        setTimeout(() => {
          el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, 100 * (index + 1));
      }
    });
  }, [mounted]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with 3D Scene */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <HeroScene />
        </div>
        <div className="container px-4 md:px-6 relative z-10 mt-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" id="hero-badge">New Experience</Badge>
            <h1 
              id="hero-title"
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            >
              Experience Events in a New Dimension
            </h1>
            <p 
              id="hero-subtitle"
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Explore venues in stunning 3D, book tickets seamlessly, and enjoy a whole new level of event planning.
            </p>
            <div 
              id="hero-cta"
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild>
                <Link to="/events">
                  Explore Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/venue/1">
                  Tour Venues <MapPin className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <div className="animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features-section"
        className="py-20 bg-secondary/50"
      >
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Revolutionizing Event Management
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with intuitive design to transform how you experience events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-background/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50">
              <CardContent className="p-6">
                <div className="mb-4 rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">3D Venue Exploration</h3>
                <p className="text-muted-foreground">
                  Immerse yourself in detailed 3D models of venues before booking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50">
              <CardContent className="p-6">
                <div className="mb-4 rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Real-time Booking</h3>
                <p className="text-muted-foreground">
                  Secure the best seats with our real-time reservation system.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50">
              <CardContent className="p-6">
                <div className="mb-4 rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Event Management</h3>
                <p className="text-muted-foreground">
                  Powerful tools for organizers to create and manage events.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50">
              <CardContent className="p-6">
                <div className="mb-4 rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Entry Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor venue capacity and attendee movement in real-time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Badge variant="outline" className="mb-2">Coming Soon</Badge>
              <h2 className="text-3xl font-bold">Featured Events</h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/events">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedEvents />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from event organizers and attendees who have transformed their event experience with SmartEventScape.
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Elevate Your Event Experience?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of users who are already experiencing events in a whole new dimension.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-primary" 
                asChild
              >
                <Link to="/events">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:text-primary hover:bg-white"
                asChild
              >
                <Link to="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
