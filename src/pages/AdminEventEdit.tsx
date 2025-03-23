
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  description: z.string().min(10, "Please provide a detailed description"),
  venue: z.string().min(1, "Please select a venue"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required"),
  capacity: z.string().min(1, "Capacity is required"),
});

const AdminEventEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [eventImages, setEventImages] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 1)),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      category: "",
      price: "",
      capacity: "",
    },
  });

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Ensure id is parsed as number
        const eventId = parseInt(id);
        
        // Fetch the event data
        const { data: event, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (error) throw error;
        
        if (event) {
          // Set form values
          form.reset({
            title: event.name,
            description: event.description || "",
            venue: event.venue || "",
            category: event.category || "",
            price: event.price?.toString() || "",
            capacity: event.max_attendees?.toString() || "",
          });
          
          // Set date range if available
          if (event.date) {
            const eventDate = new Date(event.date);
            setDateRange({
              from: eventDate,
              to: eventDate,
            });
          }
          
          // Fetch event images
          const { data: images } = await supabase
            .from('event_images')
            .select('*')
            .eq('event_id', eventId);
            
          if (images) {
            setEventImages(images);
          }
        }
      } catch (error: any) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventData();
  }, [id, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      if (!id) throw new Error("Event ID is missing");
      
      // Ensure id is parsed as number
      const eventId = parseInt(id);
      
      // Convert form values to appropriate types and ensure dates are strings
      const eventData = {
        name: values.title,
        description: values.description,
        venue: values.venue,
        category: values.category,
        price: parseFloat(values.price),
        max_attendees: parseInt(values.capacity),
        date: dateRange?.from ? dateRange.from.toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      
      // Update the event in Supabase
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId);
        
      if (error) throw error;
      
      toast.success("Event updated successfully!");
      navigate("/admin/events");
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error(error.message || "An error occurred while updating the event");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !form.formState.isDirty) {
    return (
      <div className="container py-10 mt-16 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <Button variant="outline" onClick={() => navigate("/admin/events")}>
          Cancel
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="sport">Sports</SelectItem>
                        <SelectItem value="theater">Theater</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about the event"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Event Date Range</FormLabel>
              <DateRangePicker
                from={dateRange?.from}
                to={dateRange?.to}
                onUpdate={(values) => setDateRange(values)}
                className="w-full"
              />
              <FormDescription>
                Select the start and end dates of your event
              </FormDescription>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="venue1">Main Concert Hall</SelectItem>
                        <SelectItem value="venue2">Conference Center</SelectItem>
                        <SelectItem value="venue3">Sports Arena</SelectItem>
                        <SelectItem value="venue4">Outdoor Stadium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Maximum attendees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Event Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {eventImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.image_url} 
                      alt="Event" 
                      className="w-full h-40 object-cover rounded-md"
                    />
                    {image.is_primary && (
                      <span className="absolute top-2 right-2 bg-primary text-white px-2 py-1 text-xs rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminEventEdit;
