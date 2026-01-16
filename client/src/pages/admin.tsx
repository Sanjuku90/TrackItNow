import { useQuery, useMutation } from "@tanstack/react-query";
import { Purchase } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: purchases, isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/admin/purchases"],
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status, userEmail, device, imei }: any) => {
      const res = await apiRequest("PATCH", `/api/admin/purchases/${id}`, { status, userEmail, device, imei });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
      toast({
        title: "Succès",
        description: "Statut mis à jour",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Validation des Achats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Client</TableHead>
                <TableHead>Appareil</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases?.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.userEmail}</TableCell>
                  <TableCell>{purchase.device}</TableCell>
                  <TableCell>{purchase.imei}</TableCell>
                  <TableCell>{purchase.amount} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={
                      purchase.status === "validated" ? "default" :
                      purchase.status === "rejected" ? "destructive" : 
                      purchase.status === "suspended" ? "outline" : "secondary"
                    }>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {purchase.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ 
                              id: purchase.id, 
                              status: "validated",
                              userEmail: purchase.userEmail,
                              device: purchase.device,
                              imei: purchase.imei,
                              amount: purchase.amount
                            })}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ id: purchase.id, status: "rejected" })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                      {purchase.status === "validated" && purchase.trackingType === "priority" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({ id: purchase.id, status: "suspended" })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Suspendre l'abonnement
                        </Button>
                      )}
                      {purchase.status === "suspended" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({ id: purchase.id, status: "validated" })}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Réactiver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {purchases?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Aucun achat en attente
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
