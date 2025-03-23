
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Clock, ArrowRight, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Mock data - would come from Supabase
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
    price: "$299",
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
    price: "$149",
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
    price: "$75 - $250",
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
    price: "$45",
  },
  {
    id: 5,
    title: "Marketing Innovation Conference",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "Mar 10, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Business Convention Center",
    category: "Conference",
    featured: false,
    price: "$179",
  },
  {
    id: 6,
    title: "Summer Jazz Festival",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "Jun 15-18, 2024",
    time: "Various Times",
    location: "Downtown Plaza",
    category: "Music",
    featured: false,
    price: "$25 - $120",
  },
  {
    id: 7,
    title: "International Food Fair",
    image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "Apr 8-10, 2024",
    time: "11:00 AM - 8:00 PM",
    location: "City Exhibition Center",
    category: "Culture",
    featured: false,
    price: "$15",
  },
  {
    id: 8,
    title: "Technology Expo 2024",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    date: "May 3-5, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Tech Innovation Hub",
    category: "Conference",
    featured: false,
    price: "$199",
  },
];

const categories = [
  "All", "Music", "Sports", "Conference", "Entertainment", "Culture", "Art", "Food"
];

const ExploreEvents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Filter events based on search and category
  useEffect(() => {
    const filtered = events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory]);

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
      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Explore Events</h1>
              <p className="text-muted-foreground">Discover and book tickets for upcoming events</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Explore Events</h1>
            <p className="text-muted-foreground">Discover and book tickets for upcoming events</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 w-full sm:w-[240px]"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="sm:w-auto"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        {isFilterOpen && (
          <Card className="mb-6 animate-fade-in">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Date Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="next-week" />
                      <Label htmlFor="next-week">Next week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="this-month" />
                      <Label htmlFor="this-month">This month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="next-month" />
                      <Label htmlFor="next-month">Next month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="custom-date" />
                      <Label htmlFor="custom-date">Custom dates</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="free" />
                      <Label htmlFor="free">Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="under-50" />
                      <Label htmlFor="under-50">Under $50</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="50-100" />
                      <Label htmlFor="50-100">$50 - $100</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="100-plus" />
                      <Label htmlFor="100-plus">$100+</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-3">Event Type</h3>
                  <div className="space-y-2">
                    {categories.filter(c => c !== "All").map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category.toLowerCase()}`} 
                          checked={selectedCategory === category}
                          onCheckedChange={() => setSelectedCategory(selectedCategory === category ? "All" : category)}
                        />
                        <Label htmlFor={`category-${category.toLowerCase()}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-3">Venue Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="accessible" />
                      <Label htmlFor="accessible">Accessible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="parking" />
                      <Label htmlFor="parking">Parking available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="food" />
                      <Label htmlFor="food">Food & drinks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="vip" />
                      <Label htmlFor="vip">VIP options</Label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" className="mr-2">
                  Reset
                </Button>
                <Button size="sm">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any events matching your search criteria.
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => (
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
                  {event.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Featured
                      </Badge>
                    </div>
                  )}
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
                  <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                    <span className="font-medium">{event.price}</span>
                    <Badge variant="outline" className="text-xs">
                      Tickets Available
                    </Badge>
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
        )}

        <div className="flex justify-center mt-10">
          <Button variant="outline" className="mx-auto">
            Load More Events
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExploreEvents;
