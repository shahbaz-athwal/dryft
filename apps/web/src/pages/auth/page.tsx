import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Card, CardContent } from "@repo/ui/components/card";
import { authClient } from "~/lib/auth-client";
import { SignupForm } from "./sign-up";
import { SignInForm } from "./sign-in";
import { useNavigate } from "react-router";
import { toast } from "sonner";

function Auth() {
  const navigate = useNavigate();
  const handleSignupSubmit = async (credentials: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (credentials.password !== credentials.confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email: credentials.email,
        name: credentials.name,
        password: credentials.password,
      });

      if (authError) {
        console.log(authError.message, "auth error");
        throw authError;
      }

      console.log("Sign up successful:", data);
    } catch (err) {
      console.error("Sign up error:", err);
    }
  };

  const handleSignInSubmit = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.log(authError.message, "auth error");
        throw authError;
      } else {
        toast("Sign in successful");
        navigate("/dashboard");
      }

      console.log("Sign in successful:", data);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Tabs defaultValue="signup" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
          <TabsTrigger value="signin">Sign In</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardContent className="p-0">
              <SignupForm onSubmit={handleSignupSubmit} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signin">
          <Card>
            <CardContent className="p-0">
              <SignInForm onSubmit={handleSignInSubmit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Auth;
