import Hero from "@/components/Hero";
import RoleSelection from "@/components/RoleSelection";
import ServiceCategories from "@/components/ServiceCategories";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type UserRole = "worker" | "customer" | null;

const Index = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    if (role) {
      navigate(`/get-started/${role}`);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="absolute top-6 right-6 z-10">
        <Button variant="ghost" onClick={() => navigate("/login")}>
          Sign In
        </Button>
      </div>
      <Hero />
      <ServiceCategories />
      <div id="role-selection">
        <RoleSelection onSelectRole={handleRoleSelect} />
      </div>
    </main>
  );
};

export default Index;
