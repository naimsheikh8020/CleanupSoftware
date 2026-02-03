import { MapPin, Phone, Mail, Calendar, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Separator } from '@/Components/ui/separator';
import { Button } from '@/Components/ui/button';

interface ClientDetailsProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientDetails = ({ client, open, onOpenChange }: ClientDetailsProps) => {
   console.log('Client Data:', client);
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        {
        !client ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading client details...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-4 border-white">
                    <AvatarImage src={client.avatar_url} alt={client.name} />
                    <AvatarFallback className="text-2xl bg-blue-500">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold text-white">
                      {client.name}
                    </DialogTitle>
                    <DialogDescription className="text-blue-100 mt-1">
                      Client ID: {client.id}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={client.is_active ? "default" : "destructive"} className="bg-white/20 hover:bg-white/30">
                        {client.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="buildings">Buildings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Client contact details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{client.email}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{client.prime_phone}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">
                              {client.client_profile?.location || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Member Since</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(client.date_joined).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                        <CardDescription>Client activity overview</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Invoices</p>
                            <p className="text-3xl font-bold">{client.invoice_client?.length || 0}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                            <p className="text-3xl font-bold text-green-600">
                              {client.subscription_set?.filter((s: any) => s.status === 'active').length || 0}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Buildings</p>
                            <p className="text-3xl font-bold text-purple-600">
                              {client.buildings?.length || 0}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Apartments</p>
                            <p className="text-3xl font-bold text-orange-600">
                              {client.buildings?.reduce((sum: number, b: any) => sum + (b.apartments?.length || 0), 0) || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions" className="space-y-4">
                  {client.subscription_set?.length > 0 ? (
                    <div className="space-y-4 h-96">
                      {client.subscription_set.map((sub: any) => (
                        <Card key={sub.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{sub.plan.name}</CardTitle>
                                <CardDescription>{sub.plan.description}</CardDescription>
                              </div>
                              <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                {sub.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="text-lg font-semibold">${sub.plan.amount}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Interval</p>
                                <p className="text-lg font-semibold capitalize">{sub.plan.interval}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="text-lg font-semibold">
                                  {new Date(sub.start_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Period End</p>
                                <p className="text-lg font-semibold">
                                  {new Date(sub.current_period_end).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No subscriptions found</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices">
                  {client.invoice_client?.length > 0 ? (
                    <Card className="overflow-auto h-96">
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice ID</TableHead>
                              <TableHead>Plan</TableHead>
                              <TableHead>Building</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Issued</TableHead>
                              <TableHead>Due Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {client.invoice_client.map((invoice: any) => (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.invoice_id}</TableCell>
                                <TableCell>{invoice.plan_name}</TableCell>
                                <TableCell>{invoice.building_name}</TableCell>
                                <TableCell className="font-semibold">${invoice.total_amount}</TableCell>
                                <TableCell>
                                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                    {invoice.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{invoice.date_issued}</TableCell>
                                <TableCell>{invoice.due_date}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No invoices found</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Buildings Tab */}
                <TabsContent value="buildings" className="space-y-4">
                  {client.buildings?.length > 0 ? (
                    <div className="space-y-4 h-96 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                      {client.buildings.map((building: any) => (
                        <Card key={building.id}>
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <Building2 className="h-6 w-6 text-primary mt-1" />
                              <div className="flex-1">
                                <CardTitle>{building.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {building.location}, {building.city}
                                </CardDescription>
                                <Badge variant="outline" className="mt-2 capitalize">
                                  {building.type}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">
                                  Apartments ({building.apartments?.length || 0})
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {building.apartments?.map((apt: any) => (
                                  <Card key={apt.id}>
                                    <CardContent className="pt-4">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                          <p className="font-semibold">{apt.apartment_number}</p>
                                          <Badge variant="secondary" className="text-xs">
                                            Floor {apt.floor}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{apt.location}</p>
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                          <span>{apt.living_rooms} Living</span>
                                          <span>•</span>
                                          <span>{apt.bathrooms} Bath</span>
                                        </div>
                                        {apt.apartment_code && (
                                          <code className="text-xs bg-muted px-2 py-1 rounded block">
                                            {apt.apartment_code}
                                          </code>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No buildings found</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <Separator />
            <div className="p-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
