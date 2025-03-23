
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Calendar, Ticket, Users, DollarSign, TrendingUp, ChevronRight, BarChart4, PieChart as PieChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mock analytics data - would come from Supabase
  const stats = [
    { id: 1, title: "Total Events", value: 12, icon: Calendar, change: "+3", changeType: "increase" },
    { id: 2, title: "Tickets Sold", value: 1839, icon: Ticket, change: "+12%", changeType: "increase" },
    { id: 3, title: "Total Revenue", value: "$24,950", icon: DollarSign, change: "+18%", changeType: "increase" },
    { id: 4, title: "Active Users", value: 946, icon: Users, change: "+5%", changeType: "increase" },
  ];

  const eventData = [
    { name: "Tech Summit", tickets: 450, revenue: 13500 },
    { name: "Music Festival", value: 350, revenue: 5250 },
    { name: "Sports Event", tickets: 275, revenue: 4125 },
    { name: "Art Exhibition", tickets: 120, revenue: 1800 },
    { name: "Food Fair", tickets: 220, revenue: 3300 },
    { name: "Business Conference", tickets: 180, revenue: 5400 },
  ];

  const categoryData = [
    { name: "Conference", value: 5 },
    { name: "Music", value: 3 },
    { name: "Sports", value: 2 },
    { name: "Art", value: 1 },
    { name: "Food", value: 1 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const upcomingEvents = [
    { id: 1, title: "Tech Innovation Summit", date: "Nov 15, 2023", tickets: 450, ticketsSold: 325, revenue: "$97,175" },
    { id: 2, title: "Annual Music Festival", date: "Dec 10-12, 2023", tickets: 2000, ticketsSold: 1250, revenue: "$186,250" },
    { id: 3, title: "Global Sports Championship", date: "Jan 22, 2024", tickets: 1500, ticketsSold: 980, revenue: "$73,500" },
  ];

  useEffect(() => {
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
          <div className="mb-8">
            <div className="h-8 bg-muted animate-pulse rounded w-1/4 mb-4" />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-80 bg-muted animate-pulse rounded" />
            <div className="h-80 bg-muted animate-pulse rounded" />
          </div>
          
          <div className="h-96 bg-muted animate-pulse rounded" />
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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your events, sales, and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/admin/events/new">Create Event</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div 
                        className={cn(
                          "text-xs mt-1",
                          stat.changeType === "increase" ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {stat.change} from last month
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Revenue by Event</CardTitle>
                <BarChart4 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eventData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      tick={{ fontSize: 12 }}
                      height={60}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Events by Category</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                    <Tooltip formatter={(value) => `${value} events`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
              <TabsTrigger value="draft">Draft Events</TabsTrigger>
            </TabsList>
            <Button variant="outline" asChild>
              <Link to="/admin/events">View All Events</Link>
            </Button>
          </div>
          
          <TabsContent value="upcoming" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Upcoming Events Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium py-3 px-4">Event</th>
                        <th className="text-left font-medium py-3 px-4">Date</th>
                        <th className="text-left font-medium py-3 px-4">Tickets</th>
                        <th className="text-left font-medium py-3 px-4">Sales</th>
                        <th className="text-left font-medium py-3 px-4">Revenue</th>
                        <th className="text-left font-medium py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingEvents.map((event) => (
                        <tr key={event.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-4">
                            <div className="font-medium">{event.title}</div>
                          </td>
                          <td className="py-3 px-4">{event.date}</td>
                          <td className="py-3 px-4">{event.tickets}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="mr-2">
                                {event.ticketsSold}/{event.tickets}
                              </span>
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${(event.ticketsSold / event.tickets) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{event.revenue}</td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/events/${event.id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="past" className="mt-0">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Past events analytics will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="draft" className="mt-0">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Draft events will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Ticket className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">15 new tickets sold</p>
                    <p className="text-xs text-muted-foreground">Tech Innovation Summit</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New event organizer registered</p>
                    <p className="text-xs text-muted-foreground">Global Events Inc.</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New event created</p>
                    <p className="text-xs text-muted-foreground">International Film Premiere</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Daily analytics report generated</p>
                    <p className="text-xs text-muted-foreground">October 25, 2023</p>
                    <p className="text-xs text-muted-foreground">12 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild className="justify-start gap-2">
                  <Link to="/admin/events/new">
                    <Calendar className="h-4 w-4" />
                    <span>Create Event</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/admin/analytics">
                    <BarChart4 className="h-4 w-4" />
                    <span>View Analytics</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/admin/users">
                    <Users className="h-4 w-4" />
                    <span>Manage Users</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/admin/tickets">
                    <Ticket className="h-4 w-4" />
                    <span>Check Tickets</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
