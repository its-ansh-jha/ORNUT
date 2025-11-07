import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  completed: "outline",
};

const statusLabels: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const returnStatuses = [
  { key: "requested", label: "Requested" },
  { key: "approved", label: "Approved" },
  { key: "pickup_scheduled", label: "Pickup Scheduled" },
  { key: "picked_up", label: "Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "received_at_warehouse", label: "Received at Warehouse" },
  { key: "inspecting", label: "Inspecting" },
  { key: "refund_processing", label: "Refund Processing" },
  { key: "completed", label: "Completed" },
];

function ReturnTrackingView({ returnId, currentStatus }: { returnId: string; currentStatus: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: tracking = [] } = useQuery<any[]>({
    queryKey: ["/api/returns", returnId, "tracking"],
    enabled: isOpen,
  });

  const currentStatusIndex = returnStatuses.findIndex(
    (s) => s.key === currentStatus
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between" data-testid={`button-toggle-tracking-${returnId}`}>
          <span>View Return Tracking</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        <div className="relative">
          {returnStatuses.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div key={status.key} className="flex gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-2 ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  {index < returnStatuses.length - 1 && (
                    <div
                      className={`w-0.5 h-16 ${
                        isCompleted ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`font-semibold ${
                        isCurrent ? "text-primary" : ""
                      }`}
                    >
                      {status.label}
                    </h3>
                    {isCurrent && <Badge>Current</Badge>}
                  </div>
                  {tracking
                    .filter((t: any) => t.status === status.key)
                    .map((t: any, idx: number) => (
                      <div key={idx} className="text-sm text-muted-foreground mt-1">
                        <p>{t.message}</p>
                        {t.location && (
                          <p className="text-xs">Location: {t.location}</p>
                        )}
                        <p className="text-xs">
                          {format(new Date(t.timestamp), "PPpp")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Returns() {
  const { data: returns = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/returns"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-returns-title">
        My Return Requests
      </h1>

      {returns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold mb-2">No return requests</p>
            <p className="text-muted-foreground">
              You haven't requested any returns yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((returnRequest: any) => (
            <Card key={returnRequest.id} data-testid={`card-return-${returnRequest.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{returnRequest.order?.orderNumber}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={statusColors[returnRequest.status]}>
                      {statusLabels[returnRequest.status] || returnRequest.status}
                    </Badge>
                    {returnRequest.returnStatus && (
                      <Badge variant="outline" className="capitalize">
                        {returnRequest.returnStatus.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Reason</p>
                    <p className="text-sm text-muted-foreground">
                      {returnRequest.reason}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requested on:</span>
                    <span className="font-medium">
                      {format(new Date(returnRequest.requestedAt), "PPP")}
                    </span>
                  </div>
                  {returnRequest.adminResponse && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-semibold mb-1">Admin Response</p>
                      <p className="text-sm text-muted-foreground">
                        {returnRequest.adminResponse}
                      </p>
                    </div>
                  )}
                  {returnRequest.status === "approved" && (
                    <div className="pt-3 border-t">
                      <ReturnTrackingView 
                        returnId={returnRequest.id} 
                        currentStatus={returnRequest.returnStatus || "requested"} 
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
