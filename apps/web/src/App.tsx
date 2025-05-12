import { Button } from "@repo/ui/components/ui/button";
import { useNavigate } from "react-router";
function App() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button onClick={() => navigate("/auth")}>Sign Up</Button>
      <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
    </div>
  );
}

export default App;
