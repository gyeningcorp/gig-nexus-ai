import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import GigFeed from "@/components/GigFeed";
import CustomerDashboard from "@/components/CustomerDashboard";

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {profile?.role === "worker" ? (
          <GigFeed />
        ) : (
          <CustomerDashboard />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
