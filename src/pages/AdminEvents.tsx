
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, Edit, Trash2, Eye, Search, Filter, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Event = {
  id: number;
  name: string;
  image_url: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  status: string;
  max_attendees: number;
  seats_available: number;
  description: string;
  primaryImage?: string;
};

const AdminEvents = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Fetch events from Supabase
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*');
          
        if (eventsError) throw eventsError;
        
        if (!eventsData) {
          setEvents([]);
          return;
        }
        
        // Get primary images for events
        const eventsWithImages = await Promise.all(
          eventsData.map(async (event) => {
            // Fetch primary image for event
            const { data: imageData, error: imageError } = await supabase
              .from('event_images')
              .select('image_url')
              .eq('event_id', event.id)
              .eq('is_primary', true)
              .single();
              
            // If no primary image found, try to get any image
            let primaryImage = imageData?.image_url;
            
            if (!primaryImage) {
              const { data: anyImageData } = await supabase
                .from('event_images')
                .select('image_url')
                .eq('event_id', event.id)
                .limit(1)
                .single();
                
              primaryImage = anyImageData?.image_url;
            }
            
            // Format time from database if available
            let formattedTime = '';
            if (event.time) {
              try {
                const timeObj = new Date(`2000-01-01T${event.time}`);
                formattedTime = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (e) {
                formattedTime = 'Time not available';
              }
            }
            
            return {
              ...event,
              image_url: event.image_url || primaryImage || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
              primaryImage,
              time: formattedTime || 'Time not available',
            };
          })
        );
        
        setEvents(eventsWithImages);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    };
    
    fetchEvents();
  }, []);

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    try {
      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update local state
      setEvents(events.filter(event => event.id !== eventId));
      toast.success("Event deleted successfully");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/4 mb-4" />
          <div className="h-12 bg-muted animate-pulse rounded mb-8" />
          
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen pt-20 pb-12 bg-background",
      mounted ? "animate-fade-in" : "opacity-0"
    )}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Events</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your events
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/events/new">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="sport">Sports</SelectItem>
                    <SelectItem value="theater">Theater</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  No events match your current filters.
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                  setSelectedCategory("all");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event, index) => (
              <Card 
                key={event.id} 
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  mounted && "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="md:flex">
                  <div className="md:w-1/6">
                    <div className="aspect-video md:aspect-square">
                      <img 
                        src={event.image_url} 
                        alt={event.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-6 md:w-4/6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge
                        variant={
                          event.status === "active" ? "default" :
                          event.status === "draft" ? "outline" :
                          event.status === "planned" ? "secondary" :
                          "destructive"
                        }
                      >
                        {event.status === "active" ? "Active" : 
                          event.status === "draft" ? "Draft" : 
                          event.status === "planned" ? "Planned" : 
                          "Completed"}
                      </Badge>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Date not available'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.time || 'Time not available'}</span>
                      </div>
                      <div className="flex items-center col-span-2">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span className="truncate">{event.venue || 'Location not available'}</span>
                      </div>
                    </div>
                    {event.status !== "draft" && event.status !== "planned" && event.max_attendees > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-1">
                          Ticket Sales: {event.max_attendees - (event.seats_available || 0)}/{event.max_attendees} 
                          ({Math.round(((event.max_attendees - (event.seats_available || 0)) / event.max_attendees) * 100)}%)
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${((event.max_attendees - (event.seats_available || 0)) / event.max_attendees) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-muted/30 md:w-1/6 flex flex-row md:flex-col justify-between md:justify-center items-center gap-4">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/events/${event.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        <span>View</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/admin/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        <span>Edit</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-destructive"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
