import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { requestNotificationPermission } from "@/lib/notifications";
import { useState } from "react";

export function NotificationPrompt() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || Notification.permission !== "default") {
    return null;
  }

  const handleEnable = async () => {
    await requestNotificationPermission();
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Stay Updated!
          </CardTitle>
          <CardDescription>
            Get notified about new products and special offers
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            size="sm"
            onClick={handleEnable}
            data-testid="button-enable-notifications"
          >
            Enable
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDismissed(true)}
            data-testid="button-dismiss-notifications"
          >
            Later
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
