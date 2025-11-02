import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import GigFeed from "@/components/GigFeed";

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {profile?.role === "worker" ? (
          <GigFeed />
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-6">Welcome back, {profile?.name}!</h1>
            <p className="text-muted-foreground mb-8">
              Post a new job or manage your existing jobs
            </p>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
