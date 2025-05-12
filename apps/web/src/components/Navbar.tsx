import { useNavigate } from "react-router";
import { Button } from "@repo/ui/components/ui/button";
import { ModeToggle } from "./ui/mode-toggle";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm bg-background/80 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1
          className="font-bold text-xl cursor-pointer"
          onClick={() => navigate("/")}
        >
          Dryft
        </h1>

        <div className="hidden md:flex space-x-2">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <ModeToggle />
        <Button variant="ghost" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </div>
    </nav>
  );
}
