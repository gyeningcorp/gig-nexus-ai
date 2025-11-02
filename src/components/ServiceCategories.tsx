import { Car, Package, Home, Briefcase, PawPrint, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";

const categories = [
  {
    icon: Car,
    title: "Rideshare",
    description: "Drive and earn on your schedule",
    color: "text-primary",
  },
  {
    icon: Package,
    title: "Delivery",
    description: "Food, packages, and groceries",
    color: "text-accent",
  },
  {
    icon: Home,
    title: "Home Services",
    description: "Cleaning, repairs, and more",
    color: "text-secondary",
  },
  {
    icon: Briefcase,
    title: "Freelance",
    description: "Digital work and consulting",
    color: "text-primary",
  },
  {
    icon: PawPrint,
    title: "Pet Care",
    description: "Walking, grooming, sitting",
    color: "text-accent",
  },
  {
    icon: ShoppingCart,
    title: "Errands",
    description: "Personal tasks and shopping",
    color: "text-secondary",
  },
];

const ServiceCategories = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            All Services. One App.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your path or do it all. GoGig brings every gig opportunity to your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.title}
                className="group p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-2xl bg-gradient-card mb-4 group-hover:scale-110 transition-transform">
                    <Icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
