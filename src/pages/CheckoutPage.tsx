import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { Calendar, Clock, MapPin, CreditCard, DollarSign, User, Mail, Phone, Ticket as TicketIcon, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatInRupees = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const CheckoutPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    billingZip: "",
  });

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            event_images (*)
          `)
          .eq('id', parseInt(eventId))
          .single();
          
        if (error) throw error;
        
        if (data) {
          let imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3";
          
          if (data.event_images && data.event_images.length > 0) {
            const primaryImage = data.event_images.find((img: any) => img.is_primary);
            imageUrl = primaryImage ? primaryImage.image_url : data.event_images[0].image_url;
          }
          
          const eventDate = data.date ? new Date(data.date) : new Date();
          const formattedDate = eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          
          let city = "Venue City";
          if (data.location_details) {
            try {
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
          
          const priceInINR = (data.price || 0) * 75;
          const feeInINR = priceInINR * 0.05;
          
          setEvent({
            id: data.id,
            title: data.name,
            image: imageUrl,
            description: data.description,
            date: formattedDate,
            time: data.time || "9:00 AM - 5:00 PM",
            location: city,
            venue: data.venue || "Venue Name",
            category: data.category || "Event",
            organizer: data.organizer || "Event Organizer",
            price: priceInINR,
            ticketsFee: feeInINR,
            ticketsAvailable: data.seats_available || data.max_attendees || 100,
            featured: false,
          });
        } else {
          setEvent({
            id: Number(eventId),
            title: "Tech Innovation Summit",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
            date: "Nov 15, 2023",
            time: "9:00 AM - 5:00 PM",
            location: "San Francisco, CA",
            venue: "Digital Conference Center",
            price: 22425,
            ticketsFee: 1121,
            ticketsAvailable: 325,
          });
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        setEvent({
          id: Number(eventId),
          title: "Tech Innovation Summit",
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
          date: "Nov 15, 2023",
          time: "9:00 AM - 5:00 PM",
          location: "San Francisco, CA",
          venue: "Digital Conference Center",
          price: 22425,
          ticketsFee: 1121,
          ticketsAvailable: 325,
        });
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    };
    
    fetchEventData();
  }, [eventId]);

  const totalPrice = event ? (event.price * ticketCount) + event.ticketsFee : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCompletePurchase = async () => {
    setIsProcessing(true);
    
    try {
      if (paymentMethod === "card") {
        if (!formData.cardName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
          toast.error("Please fill in all card details");
          setIsProcessing(false);
          return;
        }
      }
      
      const bookingData = {
        event_id: parseInt(eventId as string),
        quantity: ticketCount,
        user_id: null,
        status: 'confirmed',
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setBookingReference(data.booking_reference || `BK-${Math.random().toString(36).substring(2, 10)}`);
        setBookingComplete(true);
        toast.success("Booking completed successfully!");
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="h-8 bg-muted animate-pulse rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-12 bg-muted animate-pulse rounded mb-6" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
            <div>
              <div className="h-40 bg-muted animate-pulse rounded mb-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className={cn(
        "min-h-screen pt-20 pb-12 bg-background",
        mounted ? "animate-fade-in" : "opacity-0"
      )}>
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-6">
              <Check className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8 text-center">
              Thank you for your purchase. Your tickets have been reserved.
            </p>
            
            <Card className="w-full max-w-md mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-4">Your Booking Information</h2>
                  <QRCodeGenerator 
                    value={bookingReference} 
                    size={200}
                    className="mb-4"
                  />
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Booking Reference</span>
                      <span className="font-medium">{bookingReference}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Event</span>
                      <span>{event.title}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Date</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Tickets</span>
                      <span>{ticketCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Paid</span>
                      <span className="font-bold">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center p-6 pt-0">
                <p className="text-sm text-muted-foreground text-center">
                  Your e-tickets have been sent to your email address. Please present this QR code at the event entrance.
                </p>
              </CardFooter>
            </Card>
            
            <div className="flex gap-4">
              <Button asChild>
                <Link to="/">
                  Return to Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/venue/${event.id}`}>
                  View Venue in 3D
                </Link>
              </Button>
            </div>
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
      <div className="container px-4 md:px-6 max-w-6xl">
        <div className="flex items-center mb-8">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your purchase for {event?.title}
            </p>
          </div>
          <div className="hidden md:flex items-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    step >= i 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div 
                    className={cn(
                      "w-12 h-1 mx-2",
                      step > i ? "bg-primary" : "bg-secondary"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="animate-fade-in">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Ticket Selection</h2>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">General Admission</h3>
                          <p className="text-sm text-muted-foreground">Full access to all conference sessions and materials</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatInRupees(event?.price || 0)}</div>
                          <div className="flex items-center mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                            >
                              -
                            </Button>
                            <span className="mx-3 w-6 text-center">{ticketCount}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg flex justify-between items-center opacity-50">
                        <div>
                          <h3 className="font-medium">VIP Pass</h3>
                          <p className="text-sm text-muted-foreground">Premium seating, exclusive networking events, and more</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatInRupees(37425)}</div>
                          <p className="text-xs text-muted-foreground">Sold Out</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="font-medium mb-2">Select Seats (Optional)</h3>
                        <div className="bg-muted p-4 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-3">
                              Would you like to select specific seats for this event?
                            </p>
                            <Button variant="outline" asChild>
                              <Link to={`/venue/${event.id}`}>
                                View Venue in 3D
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 flex justify-end">
                    <Button onClick={handleContinue}>
                      Continue to Attendee Information
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Attendee Information</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      {ticketCount > 1 && (
                        <div className="mt-6">
                          <h3 className="font-medium mb-4">Additional Attendees</h3>
                          {[...Array(ticketCount - 1)].map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg mb-4">
                              <h4 className="font-medium mb-3">Attendee {i + 2}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`attendee-${i}-first-name`}>First Name</Label>
                                  <Input id={`attendee-${i}-first-name`} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`attendee-${i}-last-name`}>Last Name</Label>
                                  <Input id={`attendee-${i}-last-name`} />
                                </div>
                              </div>
                              <div className="space-y-2 mt-4">
                                <Label htmlFor={`attendee-${i}-email`}>Email Address</Label>
                                <Input id={`attendee-${i}-email`} type="email" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button onClick={handleContinue}>
                      Continue to Payment
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                    <Tabs defaultValue="card" onValueChange={setPaymentMethod} value={paymentMethod}>
                      <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="card">Credit Card</TabsTrigger>
                        <TabsTrigger value="paypal">PayPal</TabsTrigger>
                        <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                      </TabsList>
                      <TabsContent value="card" className="mt-0">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input 
                              id="cardName"
                              value={formData.cardName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input 
                              id="cardNumber" 
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardExpiry">Expiry Date</Label>
                              <Input 
                                id="cardExpiry" 
                                placeholder="MM/YY"
                                value={formData.cardExpiry}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardCvc">CVC</Label>
                              <Input 
                                id="cardCvc" 
                                placeholder="123"
                                value={formData.cardCvc}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingZip">Billing Zip Code</Label>
                            <Input 
                              id="billingZip"
                              value={formData.billingZip}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="paypal" className="mt-0">
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground mb-4">
                            You will be redirected to PayPal to complete your payment.
                          </p>
                          <Button className="w-full">
                            Continue with PayPal
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="bank" className="mt-0">
                        <div className="p-4 border rounded-lg mb-4">
                          <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Please transfer the total amount to the following account:
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Account Name:</span>
                              <span className="font-medium">Smart Event Corp</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Account Number:</span>
                              <span className="font-medium">1234567890</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Routing Number:</span>
                              <span className="font-medium">987654321</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reference:</span>
                              <span className="font-medium">EVENT-{eventId}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Please note: Your booking will only be confirmed after the payment has been received.
                        </p>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="px-6 py-4 flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleCompletePurchase}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : "Complete Purchase"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="mb-4">
                  <div className="flex items-center">
                    <img 
                      src={event?.image} 
                      alt={event?.title} 
                      className="w-20 h-12 object-cover rounded mr-3"
                    />
                    <div>
                      <h4 className="font-medium">{event?.title}</h4>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {event?.date}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TicketIcon className="h-4 w-4 mr-2 text-primary" />
                      <span>General Admission</span>
                    </div>
                    <span>x{ticketCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>Venue</span>
                    </div>
                    <span>{event?.venue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>Time</span>
                    </div>
                    <span>{event?.time}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tickets (x{ticketCount})</span>
                    <span>{formatInRupees((event?.price || 0) * ticketCount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>{formatInRupees(event?.ticketsFee || 0)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatInRupees(totalPrice)}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg flex items-start">
                  <div className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All sales are final. Please review our refund policy for more information.
                    Your tickets will be delivered via email after purchase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
