import { useState } from "react";
import Hero from "@/components/Hero";
import RoleSelection from "@/components/RoleSelection";
import GigMarketplace from "@/components/GigMarketplace";
import ServiceCategories from "@/components/ServiceCategories";

type UserRole = "worker" | "customer" | null;

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowMarketplace(true);
  };

  if (showMarketplace && selectedRole) {
    return <GigMarketplace role={selectedRole} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <ServiceCategories />
      <RoleSelection onSelectRole={handleRoleSelect} />
    </main>
  );
};

export default Index;
