import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Tag, Award, Ticket, Info, ArrowRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";


// Helper function to format price in Indian Rupees
const formatInRupees = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};


// Conversion rate (example: 1 USD = 75 INR)
const USD_TO_INR = 75;

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Get the event data from Supabase
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            event_images (*)
          `)
          .eq('id', parseInt(id))
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Find primary image or use the first one
          let imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3";
          const images = [];
          
          if (data.event_images && data.event_images.length > 0) {
            const primaryImage = data.event_images.find((img: any) => img.is_primary);
            imageUrl = primaryImage ? primaryImage.image_url : data.event_images[0].image_url;
            
            // Add all images to the gallery
            images.push(...data.event_images.map((img: any) => img.image_url));
          } else {
            // Add a default image if none available
            images.push(imageUrl);
          }
          
          // Format the date for display
          const eventDate = data.date ? new Date(data.date) : new Date();
          const formattedDate = eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Extract city from location details safely
          let city = "Venue City";
          if (data.location_details) {
            try {
              // Handle both string and object JSON formats
              const locationDetails = typeof data.location_details === 'string' 
                ? JSON.parse(data.location_details) 
                : data.location_details;
                
              if (locationDetails && typeof locationDetails === 'object' && 'city' in locationDetails) {
                city = locationDetails.city;
              }
            } catch (e) {
              console.error("Error parsing location details:", e);
            }
          }
          
          // Convert price to INR
          const priceInINR = (data.price || 0) * USD_TO_INR;
          
          // Set the event data
          setEvent({
            id: data.id,
            title: data.name,
            images: images,
            description: data.description || "No description available.",
            date: formattedDate,
            time: data.time || "9:00 AM - 5:00 PM",
            location: city,
            venueId: 1, // We'll use a fixed value for now
            venueName: data.venue || "Venue Name",
            category: data.category || "Event",
            organizer: data.organizer || "Event Organizer",
            price: priceInINR,
            ticketsAvailable: data.seats_available || data.max_attendees || 100,
            featured: false,
            attendees: Math.floor(Math.random() * 50) + 10, // Random number for now
          });
          
          setMainImage(imageUrl);
        } else {
          // Fallback if no data is found
          setEvent({
            id: Number(id),
            title: "Event Not Found",
            images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3"],
            description: "This event could not be found or has been removed.",
            date: "Unknown date",
            time: "Unknown time",
            location: "Unknown location",
            venueId: 1,
            venueName: "Unknown venue",
            category: "Unknown",
            organizer: "Unknown",
            price: 0,
            ticketsAvailable: 0,
            featured: false,
            attendees: 0,
          });
          
          setMainImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        // Set default event if error occurs
        setEvent({
          id: Number(id),
          title: "Error Loading Event",
          images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3"],
          description: "There was an error loading this event. Please try again later.",
          date: "Unknown date",
          time: "Unknown time",
          location: "Unknown location",
          venueId: 1,
          venueName: "Unknown venue",
          category: "Unknown",
          organizer: "Unknown",
          price: 0,
          ticketsAvailable: 0,
          featured: false,
          attendees: 0,
        });
        
        setMainImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);

  const setMainImageHandler = (image: string) => {
    setMainImage(image);
  };

  const renderEventContent = () => {
    if (!event) return null;
    
    return (
      <div className="animate-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="relative aspect-video overflow-hidden rounded-xl mb-4">
                <img
                  src={mainImage}
                  alt={event.title}
                  className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                />
              </div>
              
              {event.images && event.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {event.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImageHandler(image)}
                      className={cn(
                        "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border transition-all hover:opacity-100",
                        mainImage === image ? "opacity-100 ring-2 ring-primary" : "opacity-80"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${event.title} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {event.category}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Ticket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Price per ticket</p>
                    <p className="text-2xl font-bold">{formatInRupees(event.price)}</p>
                  </div>
                </div>
                <Button asChild className="px-6">
                  <Link to={`/checkout?eventId=${event.id}`}>
                    Get Tickets
                  </Link>
                </Button>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">About this event</h2>
                <div className="prose max-w-none dark:prose-invert">
                  <p>{event.description}</p>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Event Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Venue</p>
                      <p className="font-medium">{event.venueName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Organizer</p>
                      <p className="font-medium">{event.organizer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available Tickets</p>
                      <p className="font-medium">{event.ticketsAvailable}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Attendees</p>
                      <p className="font-medium">{event.attendees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-6">
  <Card>
    <CardContent className="p-4 space-y-4">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold mb-2">Interested in attending?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Secure your spot now before tickets run out!
        </p>
        
        <Button
  className="w-full"
  onClick={() => {
    const a = document.createElement('a');
    a.href = `/payment?eventId=${event.id}`;
    a.click();
  }}
>
  Get Tickets
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>



      


                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  Explore the Venue in 3D
                </h3>
                <div className="aspect-video rounded-md bg-muted overflow-hidden relative">
                  <img
                    src={event.images?.[0] || mainImage}
                    alt="Venue preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button asChild variant="secondary">
                      <Link to={`/venue/${event.venueId}`}>
                        View 3D Venue
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Share this event
                </h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
                      <path d="M9 13v-1h6v1" />
                      <path d="M11 18h2" />
                      <path d="M14 13V9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4" />
                    </svg>
                    <span className="sr-only">Copy Link</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 pb-12 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-muted rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-40 bg-muted rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-32 bg-muted rounded mb-4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-16 pb-12 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground">
              Sorry, the event you are looking for could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 bg-background">
      <div className="container px-4 md:px-6 max-w-6xl">
        {renderEventContent()}
      </div>
    </div>
  );
};

export default EventDetails;
