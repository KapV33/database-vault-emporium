
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database } from "lucide-react";

interface InvitationGateProps {
  onValidCode: () => void;
}

const InvitationGate = ({ onValidCode }: InvitationGateProps) => {
  const [invitationCode, setInvitationCode] = useState("");
  const { toast } = useToast();

  const VALID_CODE = "HG73A8P1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invitationCode === VALID_CODE) {
      onValidCode();
      toast({
        title: "Access Granted!",
        description: "Welcome to DNV Databases",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid invitation code",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-dnv-dark-blue/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Database className="h-8 w-8 text-dnv-orange" />
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">DNV Databases</CardTitle>
              <CardDescription>Premium Database Solutions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="invitation-code" className="text-foreground">Invitation Code</Label>
              <Input
                id="invitation-code"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="Enter invitation code"
                className="mt-1 border-border bg-input"
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-dnv-orange hover:bg-dnv-orange/80 text-white"
            >
              Enter Shop
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationGate;
