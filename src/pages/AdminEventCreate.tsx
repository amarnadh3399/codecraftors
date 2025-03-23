
import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  description: z.string().min(10, "Please provide a detailed description"),
  venue: z.string().min(1, "Please select a venue"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required"),
  capacity: z.string().min(1, "Capacity is required"),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const AdminEventCreate = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 1)),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Validate files
    const invalidFiles = newFiles.filter(
      file => !ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );
    
    if (invalidFiles.length > 0) {
      toast.error("Some files were not added. Images must be JPG, PNG or WebP and less than 5MB.");
      return;
    }
    
    // Add files to state
    const validFiles = newFiles.filter(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
    );
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
    
    // Set first image as primary if none selected yet
    if (selectedImages.length === 0 && validFiles.length > 0) {
      setPrimaryImageIndex(0);
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...previewImages];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedImages(newImages);
    setPreviewImages(newPreviews);
    
    // Adjust primary image index if needed
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(newImages.length > 0 ? 0 : -1);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };
  
  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedImages.length === 0) {
      toast.error("Please upload at least one image for the event");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, insert the event data
      const eventData = {
        name: values.title,
        description: values.description,
        venue: values.venue,
        category: values.category,
        price: parseFloat(values.price),
        max_attendees: parseInt(values.capacity),
        date: dateRange?.from ? dateRange.from.toISOString() : null,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      
      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select('id')
        .single();
        
      if (eventError) throw eventError;
      
      if (!newEvent?.id) {
        throw new Error("Failed to create event");
      }
      
      // Now upload all images
      const imageUrls = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const isPrimary = i === primaryImageIndex;
        
        // Upload image to storage
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL for the uploaded image
        const { data: publicUrl } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);
          
        if (!publicUrl.publicUrl) {
          throw new Error("Failed to get public URL for image");
        }
        
        imageUrls.push({
          url: publicUrl.publicUrl,
          isPrimary: isPrimary
        });
      }
      
      // Use the edge function to create event with images
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          eventData: {
            ...eventData,
            id: newEvent.id
          },
          images: imageUrls
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to save event images");
      }
      
      toast.success("Event created successfully!");
      navigate("/admin/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "An error occurred while creating the event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Event</h1>
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
              <FormLabel htmlFor="event-images">Event Images</FormLabel>
              <FormDescription className="mb-4">
                Upload images for your event. First image or selected image will be the primary image.
              </FormDescription>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {previewImages.map((preview, index) => (
                  <div 
                    key={index}
                    className={`relative group border rounded-md overflow-hidden h-40 ${
                      primaryImageIndex === index ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {primaryImageIndex !== index && (
                        <Button 
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setPrimaryImage(index)}
                        >
                          Set as Primary
                        </Button>
                      )}
                      <Button 
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {primaryImageIndex === index && (
                      <span className="absolute top-2 right-2 bg-primary text-white px-2 py-1 text-xs rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
                
                <label 
                  htmlFor="image-upload" 
                  className="border-2 border-dashed rounded-md h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload Image</span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </div>
              
              {selectedImages.length === 0 && (
                <p className="text-sm text-destructive">Please upload at least one image for the event</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting || selectedImages.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminEventCreate;
