import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { format } from "date-fns";

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
          {returns.map((returnRequest) => (
            <Card key={returnRequest.id} data-testid={`card-return-${returnRequest.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{returnRequest.orderNumber}
                  </CardTitle>
                  <Badge variant={statusColors[returnRequest.status]}>
                    {statusLabels[returnRequest.status] || returnRequest.status}
                  </Badge>
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
                  {returnRequest.adminNotes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-semibold mb-1">Admin Response</p>
                      <p className="text-sm text-muted-foreground">
                        {returnRequest.adminNotes}
                      </p>
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
