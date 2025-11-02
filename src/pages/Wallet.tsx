import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
};

const Wallet = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect workers away from wallet page
  useEffect(() => {
    if (profile?.role === "worker") {
      toast({
        title: "Access Denied",
        description: "Wallet is only available for customers",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [profile, navigate, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setTransactions(data);
    }
  };

  const addFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const amount = parseFloat(addAmount);

    // Update wallet balance
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        wallet_balance: (profile?.wallet_balance || 0) + amount
      })
      .eq("user_id", user?.id);

    // Create transaction
    const { error: transError } = await supabase.from("transactions").insert({
      amount,
      type: "deposit",
      sender_id: user?.id,
      receiver_id: user?.id
    });

    if (profileError || transError) {
      toast({
        title: "Error",
        description: "Failed to add funds",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Funds Added!",
        description: `$${amount.toFixed(2)} added to your wallet`
      });
      setAddAmount("");
      fetchTransactions();
      window.location.reload(); // Refresh to update balance
    }

    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Wallet</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <span className="text-4xl font-bold">
                  {profile?.wallet_balance?.toFixed(2) || "0.00"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Add Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addFunds} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Add Funds (Test)"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.sender_id === user?.id ? (
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {transaction.sender_id === user?.id ? "-" : "+"}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Wallet;
