import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, QrCode, Download, Ticket, User, Mail, Phone, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          navigate("/login");
          return;
        }

        if (!session) {
          navigate("/login");
          return;
        }

        // Fetch user data
        const { data: user, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        // Set user data
        setUserData({
          name: user?.user?.user_metadata?.full_name || "Admin User",
          email: user?.user?.email || "admin@example.com",
          phone: user?.user?.user_metadata?.phone || "+1 (555) 123-4567",
          avatar: user?.user?.user_metadata?.avatar_url || "https://randomuser.me/api/portraits/men/32.jpg",
        });

        // Mock tickets data - in a real app you would fetch this from Supabase
        setTickets([
          {
            id: 1,
            eventId: 1,
            eventTitle: "Tech Innovation Summit",
            eventImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
            date: "Nov 15, 2023",
            time: "9:00 AM - 5:00 PM",
            venue: "Digital Conference Center",
            location: "San Francisco, CA",
            seat: "General Admission",
            ticketType: "Standard",
            ticketCode: "TIS-23-AJ-1598",
            status: "upcoming",
          },
          {
            id: 2,
            eventId: 3,
            eventTitle: "Global Sports Championship",
            eventImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
            date: "Jan 22, 2024",
            time: "7:30 PM",
            venue: "Metropolitan Arena",
            location: "New York, NY",
            seat: "Section B, Row 12, Seat 23",
            ticketType: "Premium",
            ticketCode: "GSC-24-AJ-2467",
            status: "upcoming",
          },
          {
            id: 3,
            eventId: 5,
            eventTitle: "Music Festival 2023",
            eventImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
            date: "Sep 10, 2023",
            time: "All Day",
            venue: "Riverside Park",
            location: "Chicago, IL",
            seat: "General Admission",
            ticketType: "VIP",
            ticketCode: "MF-23-AJ-3782",
            status: "past",
          },
        ]);

        setIsLoading(false);
        setMounted(true);
      } catch (error) {
        console.error("Error in profile:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="h-10 bg-muted animate-pulse rounded mb-6 w-1/3" />
          <div className="h-12 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingTickets = tickets.filter(ticket => ticket.status === 'upcoming');
  const pastTickets = tickets.filter(ticket => ticket.status === 'past');

  return (
    <div className={cn(
      "min-h-screen pt-20 pb-12 bg-background",
      mounted ? "animate-fade-in" : "opacity-0"
    )}>
      <div className="container px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={userData?.avatar} alt={userData?.name} />
              <AvatarFallback>{userData?.name?.split(' ').map(n => n[0]).join('') || 'AU'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{userData?.name}</h1>
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-1" />
                <span>{userData?.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate("/profile/settings")}>
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="upcoming" className="relative">
                Upcoming Events
                {upcomingTickets.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {upcomingTickets.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="upcoming" className="mt-0">
            {upcomingTickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🎫</div>
                  <h3 className="text-2xl font-medium mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any upcoming events. Browse and book tickets to exciting events!
                  </p>
                  <Button>Browse Events</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {upcomingTickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/4">
                        <div className="aspect-[4/3] h-full">
                          <img 
                            src={ticket.eventImage} 
                            alt={ticket.eventTitle} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-6 md:w-2/4">
                        <Badge className="mb-2">{ticket.ticketType}</Badge>
                        <h3 className="text-xl font-semibold mb-2">{ticket.eventTitle}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                            <span>{ticket.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            <span>{ticket.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span>{ticket.venue}, {ticket.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Ticket className="h-4 w-4 mr-2 text-primary" />
                            <span>{ticket.seat}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 bg-muted/50 md:w-1/4 flex flex-col">
                        <div className="mb-4 flex-grow">
                          <div className="text-sm font-medium mb-1">Ticket Code</div>
                          <div className="font-mono text-xs bg-background p-2 rounded border">
                            {ticket.ticketCode}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full" asChild>
                            <a href="#">
                              <QrCode className="h-4 w-4 mr-2" />
                              View Ticket
                            </a>
                          </Button>
                          <Button variant="outline" className="w-full" asChild>
                            <a href="#">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-0">
            {pastTickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-medium mb-2">No past events</h3>
                  <p className="text-muted-foreground">
                    You don't have any past events.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastTickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                    <div className="md:flex">
                      <div className="md:w-1/6">
                        <div className="aspect-square">
                          <img 
                            src={ticket.eventImage} 
                            alt={ticket.eventTitle} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-4 md:w-5/6">
                        <h3 className="font-semibold">{ticket.eventTitle}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-primary" />
                            <span>{ticket.date}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-primary" />
                            <span>{ticket.venue}</span>
                          </div>
                          <div className="flex items-center">
                            <Ticket className="h-3 w-3 mr-1 text-primary" />
                            <span>{ticket.ticketType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-0">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't added any events to your favorites list yet.
                </p>
                <Button>Browse Events</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <h2 className="text-2xl font-bold mb-4">Your Information</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Personal Details</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <span>{userData?.name}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Email Address</div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-primary" />
                      <span>{userData?.email}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Phone Number</div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      <span>{userData?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{tickets.length}</div>
                    <div className="text-sm text-muted-foreground">Events Attended</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{upcomingTickets.length}</div>
                    <div className="text-sm text-muted-foreground">Upcoming Events</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Favorited Events</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">3</div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 flex justify-end border-t">
            <Button variant="outline">Edit Profile</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
