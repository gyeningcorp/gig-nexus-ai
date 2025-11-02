import Hero from "@/components/Hero";
import RoleSelection from "@/components/RoleSelection";
import ServiceCategories from "@/components/ServiceCategories";
import { useNavigate } from "react-router-dom";

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
      <Hero />
      <ServiceCategories />
      <RoleSelection onSelectRole={handleRoleSelect} />
    </main>
  );
};

export default Index;
