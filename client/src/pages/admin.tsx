import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Purchase, OperationLog, PURCHASE_STATUS_TRANSITIONS } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, History, Filter, MapPin, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  validated: "Validée",
  rejected: "Rejetée",
  suspended: "Suspendue",
  expired: "Expirée",
};

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "validated" ? "default" :
    status === "rejected" || status === "expired" ? "destructive" :
    status === "suspended" ? "outline" : "secondary";
  return <Badge variant={variant} data-testid={`status-${status}`}>{STATUS_LABEL[status] ?? status}</Badge>;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [pendingTransition, setPendingTransition] = useState<{ id: number; from: string; to: string } | null>(null);
  const [reason, setReason] = useState("");
  const [logsForId, setLogsForId] = useState<number | null>(null);

  const [locationTarget, setLocationTarget] = useState<Purchase | null>(null);
  const [presetLat, setPresetLat] = useState("");
  const [presetLng, setPresetLng] = useState("");

  const { data: purchases, isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/operations"],
  });

  const transition = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      const res = await apiRequest("PATCH", `/api/operations/${id}/status`, { status, reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      if (logsForId) queryClient.invalidateQueries({ queryKey: ["/api/operations", logsForId, "logs"] });
      toast({ title: "Succès", description: "Statut mis à jour" });
      setPendingTransition(null);
      setReason("");
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message ?? "Transition refusée", variant: "destructive" });
    },
  });

  const setLocation = useMutation({
    mutationFn: async ({ id, lat, lng }: { id: number; lat: string; lng: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/purchases/${id}/preset-location`, { lat, lng });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({ title: "Localisation définie", description: "La localisation prédéfinie a été enregistrée." });
      setLocationTarget(null);
      setPresetLat("");
      setPresetLng("");
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message ?? "Impossible de définir la localisation", variant: "destructive" });
    },
  });

  const clearLocation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/purchases/${id}/preset-location`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({ title: "Localisation effacée", description: "La localisation prédéfinie a été supprimée." });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message ?? "Impossible d'effacer la localisation", variant: "destructive" });
    },
  });

  const { data: logs } = useQuery<OperationLog[]>({
    queryKey: ["/api/operations", logsForId, "logs"],
    enabled: logsForId !== null,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = (purchases ?? []).filter(p => filter === "all" ? true : p.status === filter);
  const pendingCount = (purchases ?? []).filter(p => p.status === "pending").length;

  function openTransition(p: Purchase, to: string) {
    setPendingTransition({ id: p.id, from: p.status, to });
    setReason("");
  }

  function openLocationDialog(p: Purchase) {
    setLocationTarget(p);
    setPresetLat(p.presetLat ?? "");
    setPresetLng(p.presetLng ?? "");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administration des opérations</h1>
          <p className="text-sm text-muted-foreground mt-1">{pendingCount} opération(s) en attente de validation</p>
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validées</SelectItem>
              <SelectItem value="suspended">Suspendues</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
              <SelectItem value="expired">Expirées</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetch('/api/admin/create-test-purchase', { method: 'POST' });
              queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
            }}
            data-testid="button-create-test"
          >
            Créer un test
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File d'opérations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Client</TableHead>
                <TableHead>Appareil</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((purchase) => {
                const allowed = PURCHASE_STATUS_TRANSITIONS[purchase.status] ?? [];
                const hasPreset = !!(purchase.presetLat && purchase.presetLng);
                return (
                  <TableRow key={purchase.id} data-testid={`row-operation-${purchase.id}`}>
                    <TableCell>{purchase.userEmail}</TableCell>
                    <TableCell>{purchase.device}</TableCell>
                    <TableCell className="font-mono text-xs">{purchase.imei}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.trackingType}</Badge>
                    </TableCell>
                    <TableCell>${(purchase.amount / 100).toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={purchase.status} /></TableCell>
                    <TableCell>
                      {hasPreset ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs font-mono gap-1 flex items-center">
                            <MapPin className="h-3 w-3 text-green-500" />
                            {parseFloat(purchase.presetLat!).toFixed(4)}, {parseFloat(purchase.presetLng!).toFixed(4)}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            title="Effacer la localisation prédéfinie"
                            disabled={clearLocation.isPending}
                            onClick={() => clearLocation.mutate(purchase.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aléatoire (Lomé)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {allowed.map(to => (
                          <Button
                            key={to}
                            size="sm"
                            variant="outline"
                            disabled={transition.isPending}
                            onClick={() => openTransition(purchase, to)}
                            data-testid={`button-transition-${to}-${purchase.id}`}
                          >
                            → {STATUS_LABEL[to]}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Définir une localisation"
                          onClick={() => openLocationDialog(purchase)}
                          data-testid={`button-location-${purchase.id}`}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setLogsForId(purchase.id)}
                          data-testid={`button-logs-${purchase.id}`}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Aucune opération
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preset location dialog */}
      <Dialog open={locationTarget !== null} onOpenChange={(o) => !o && setLocationTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Définir une localisation prédéfinie
            </DialogTitle>
            <DialogDescription>
              Choisissez les coordonnées GPS qui seront envoyées au client{" "}
              <strong>{locationTarget?.userEmail}</strong> lors du prochain envoi de localisation.
              Laissez vide pour utiliser une position aléatoire à Lomé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="preset-lat">Latitude</Label>
                <Input
                  id="preset-lat"
                  placeholder="ex: 6.1311"
                  value={presetLat}
                  onChange={(e) => setPresetLat(e.target.value)}
                  type="number"
                  step="any"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="preset-lng">Longitude</Label>
                <Input
                  id="preset-lng"
                  placeholder="ex: 1.2228"
                  value={presetLng}
                  onChange={(e) => setPresetLng(e.target.value)}
                  type="number"
                  step="any"
                />
              </div>
            </div>

            {presetLat && presetLng && (
              <a
                href={`https://www.google.com/maps?q=${presetLat},${presetLng}&z=15`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                Vérifier sur Google Maps
              </a>
            )}

            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Coordonnées Lomé (exemples) :</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span>Blvd du 13 Janvier</span><span className="font-mono">6.1311, 1.2228</span>
                <span>Av. de la Libération</span><span className="font-mono">6.1256, 1.2154</span>
                <span>Route d'Aného</span><span className="font-mono">6.1458, 1.2345</span>
                <span>Route de l'Aéroport</span><span className="font-mono">6.1845, 1.2156</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLocationTarget(null)}>
              Annuler
            </Button>
            <Button
              disabled={setLocation.isPending || !presetLat || !presetLng}
              onClick={() => locationTarget && setLocation.mutate({ id: locationTarget.id, lat: presetLat, lng: presetLng })}
            >
              {setLocation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition confirm dialog with reason */}
      <Dialog open={pendingTransition !== null} onOpenChange={(o) => !o && setPendingTransition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la transition</DialogTitle>
            <DialogDescription>
              {pendingTransition && (
                <>Passer cette opération de <b>{STATUS_LABEL[pendingTransition.from]}</b> à <b>{STATUS_LABEL[pendingTransition.to]}</b> ?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Raison (optionnelle)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            data-testid="input-reason"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingTransition(null)} data-testid="button-cancel-transition">
              Annuler
            </Button>
            <Button
              disabled={transition.isPending}
              onClick={() => pendingTransition && transition.mutate({ id: pendingTransition.id, status: pendingTransition.to, reason })}
              data-testid="button-confirm-transition"
            >
              {transition.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit logs dialog */}
      <Dialog open={logsForId !== null} onOpenChange={(o) => !o && setLogsForId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Journal de l'opération #{logsForId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(logs ?? []).map(l => (
              <div key={l.id} className="border rounded-lg p-3 text-sm" data-testid={`log-${l.id}`}>
                <div className="flex justify-between gap-2 mb-1">
                  <span>
                    <StatusBadge status={l.fromStatus} /> → <StatusBadge status={l.toStatus} />
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(l.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Par : {l.actorEmail ?? "—"}
                </div>
                {l.reason && <div className="mt-1 italic">« {l.reason} »</div>}
              </div>
            ))}
            {(logs ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun événement</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
