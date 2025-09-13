"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, FileText, Mail, MessageCircle } from "lucide-react"

interface DetectionCompsProps {
  onRedirect?: () => void
}

export function DetectionComps({ onRedirect }: DetectionCompsProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription className="text-base">Your account has been temporarily deactivated</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This action was taken due to a violation of our terms of service or suspicious activity detected on your
              account.
            </p>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact our support team.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Need Help?</h4>
            <div className="grid gap-2">
              <Button variant="outline" size="sm" className="justify-start h-auto p-3 bg-transparent">
                <Mail className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Email Support</div>
                  <div className="text-xs text-muted-foreground">support@company.com</div>
                </div>
              </Button>

              <Button variant="outline" size="sm" className="justify-start h-auto p-3 bg-transparent">
                <MessageCircle className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Live Chat</div>
                  <div className="text-xs text-muted-foreground">Available 24/7</div>
                </div>
              </Button>

              <Button variant="outline" size="sm" className="justify-start h-auto p-3 bg-transparent">
                <FileText className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Appeal Process</div>
                  <div className="text-xs text-muted-foreground">Submit an appeal</div>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          <div className="text-center space-y-4">
            <div className="text-xs text-muted-foreground">
              Reference ID: <span className="font-mono">SUS-{Date.now().toString().slice(-8)}</span>
            </div>

            {onRedirect && (
              <Button onClick={onRedirect} variant="secondary" className="w-full">
                Return to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
