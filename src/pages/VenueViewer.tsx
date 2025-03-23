import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, MapPin, Users, Calendar, Camera, Box, Layers, Rotate3d } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const VenueViewer = () => {
  const { venueId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    dispose: () => void;
  } | null>(null);
  const [activeView, setActiveView] = useState("interior");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const venueData = {
    id: venueId,
    name: "Metropolitan Arena",
    description: "A state-of-the-art venue with flexible configurations suitable for concerts, sports events, and conferences. Features premium acoustics and comfortable seating for up to 20,000 attendees.",
    location: "101 Broadway, New York, NY 10003",
    capacity: 20000,
    amenities: ["Premium Seating", "VIP Boxes", "Food Court", "Parking", "Accessibility Features"],
    sections: ["Floor", "Lower Level", "Middle Level", "Upper Level", "VIP Boxes"],
    upcomingEvents: 12,
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const arenaGeometry = new THREE.CylinderGeometry(30, 30, 10, 64);
    const arenaMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.2,
      roughness: 0.8,
    });
    const arena = new THREE.Mesh(arenaGeometry, arenaMaterial);
    arena.receiveShadow = true;
    arena.position.y = -5;
    scene.add(arena);

    const floorGeometry = new THREE.CircleGeometry(20, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x3382f8,
      metalness: 0.1,
      roughness: 0.4,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const sectionColors = {
      "Floor": 0xff0000,
      "Lower Level": 0x00ff00,
      "Middle Level": 0x0000ff,
      "Upper Level": 0xffff00,
      "VIP Boxes": 0xff00ff,
    };

    const createSeatingSection = (
      radius: number, 
      height: number, 
      yPosition: number, 
      color: number, 
      name: string
    ) => {
      const sectionGeometry = new THREE.RingGeometry(radius - 2, radius, 64);
      const sectionMaterial = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.7,
      });
      const section = new THREE.Mesh(sectionGeometry, sectionMaterial);
      section.rotation.x = -Math.PI / 2;
      section.position.y = yPosition;
      section.userData = { name };
      scene.add(section);
      return section;
    };

    const sections: THREE.Mesh[] = [
      createSeatingSection(25, 1, 0.1, sectionColors["Floor"], "Floor"),
      createSeatingSection(30, 1, 1, sectionColors["Lower Level"], "Lower Level"),
      createSeatingSection(35, 1, 3, sectionColors["Middle Level"], "Middle Level"),
      createSeatingSection(40, 1, 5, sectionColors["Upper Level"], "Upper Level"),
    ];

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const boxGeometry = new THREE.BoxGeometry(3, 2, 3);
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: sectionColors["VIP Boxes"],
        transparent: true,
        opacity: 0.7,
      });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.x = Math.cos(angle) * 28;
      box.position.z = Math.sin(angle) * 28;
      box.position.y = 6;
      box.rotation.y = angle + Math.PI / 2;
      box.userData = { name: "VIP Boxes" };
      scene.add(box);
      sections.push(box);
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(sections);
      if (intersects.length > 0) {
        const selected = intersects[0].object as THREE.Mesh;
        if (selected.userData?.name) {
          setSelectedSection(selected.userData.name);
          
          sections.forEach(section => {
            const material = section.material as THREE.MeshStandardMaterial;
            material.opacity = 0.7;
          });
          
          const selectedMaterial = selected.material as THREE.MeshStandardMaterial;
          selectedMaterial.opacity = 1;
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      dispose: () => {
        window.removeEventListener('resize', handleResize);
        renderer.domElement.removeEventListener('click', handleClick);
        containerRef.current?.removeChild(renderer.domElement);
        sections.forEach(section => {
          scene.remove(section);
          section.geometry.dispose();
          (section.material as THREE.Material).dispose();
        });
        arenaGeometry.dispose();
        arenaMaterial.dispose();
        floorGeometry.dispose();
        floorMaterial.dispose();
      }
    };

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, [venueId]);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    if (activeView === "interior") {
      sceneRef.current.camera.position.set(0, 30, 40);
    } else {
      sceneRef.current.camera.position.set(60, 40, 60);
    }
    
    sceneRef.current.controls.update();
  }, [activeView]);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Badge variant="outline" className="mb-2">3D Venue</Badge>
              <h1 className="text-3xl md:text-4xl font-bold">{venueData.name}</h1>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{venueData.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Photo Gallery</span>
              </Button>
              <Button className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>View Events</span>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-muted rounded-lg overflow-hidden relative mb-4">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-medium">Loading 3D venue model...</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-card border-b">
                  <div className="flex gap-2">
                    <Button 
                      variant={activeView === "interior" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveView("interior")}
                      className="h-8"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      Interior
                    </Button>
                    <Button 
                      variant={activeView === "exterior" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveView("exterior")}
                      className="h-8"
                    >
                      <Layers className="h-4 w-4 mr-1" />
                      Exterior
                    </Button>
                  </div>
                  <div className="text-xs flex items-center text-muted-foreground">
                    <Rotate3d className="h-4 w-4 mr-1" />
                    Click and drag to explore
                  </div>
                </div>
                <div 
                  ref={containerRef} 
                  className="w-full h-[500px]"
                ></div>
                {selectedSection && (
                  <div className="p-4 bg-card border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Selected Section</span>
                        <h3 className="text-lg font-medium">{selectedSection}</h3>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Venue Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">Capacity</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>{venueData.capacity.toLocaleString()} attendees</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">Sections</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {venueData.sections.map((section) => (
                          <Badge key={section} variant="outline">{section}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">Upcoming Events</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>{venueData.upcomingEvents} events scheduled</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="about" className="mt-8">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 sm:inline-flex">
            <TabsTrigger value="about" className="whitespace-nowrap">About</TabsTrigger>
            <TabsTrigger value="amenities" className="whitespace-nowrap">Amenities</TabsTrigger>
            <TabsTrigger value="events" className="whitespace-nowrap">Upcoming Events</TabsTrigger>
            <TabsTrigger value="transportation" className="whitespace-nowrap">Transportation</TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">About {venueData.name}</h3>
                <p className="text-muted-foreground mb-6">
                  {venueData.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <img 
                    src="https://images.unsplash.com/photo-1578736641330-3155e606cd40?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3" 
                    alt="Venue interior" 
                    className="rounded-lg"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3" 
                    alt="Venue exterior" 
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="amenities" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Venue Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {venueData.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center p-4 bg-muted rounded-lg">
                      <div className="h-8 w-8 mr-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Upcoming Events</h3>
                <p className="text-muted-foreground">No events to display at this time.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transportation" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Transportation & Parking</h3>
                <p className="text-muted-foreground">Information about transportation options and parking will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VenueViewer;
