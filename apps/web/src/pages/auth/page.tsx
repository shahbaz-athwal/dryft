import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { authClient } from "~/lib/auth-client";
import { SignupForm } from "./sign-up";
import { SignInForm } from "./sign-in";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignUpSchema, SignUpSchemaInfer } from "@repo/schema/sign-up";
import { SignInSchema, SignInSchemaInfer } from "@repo/schema/sign-in";

function Auth() {
  const navigate = useNavigate();

  const signUpForm = useForm<SignUpSchemaInfer>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signInForm = useForm<SignInSchemaInfer>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignupSubmit = async (formData: SignUpSchemaInfer) => {
    try {
      const { error: authError } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (authError) {
        toast.error(authError.message);
        throw authError;
      }

      toast.success("Account created successfully", {
        description: "We've sent you an email to verify your account",
      });
    } catch (err) {
      toast.error("Sign up failed");
      console.error("Sign up error:", err);
    }
  };

  const handleSignInSubmit = async (formData: SignInSchemaInfer) => {
    try {
      const { error: authError } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast.error(authError.message, {
          style: {
            backgroundColor: "#ffaa00",
          },
        });
      } else {
        toast.success("Sign in successful");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Sign in failed");
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
              <SignupForm
                form={signUpForm}
                onSubmit={signUpForm.handleSubmit(handleSignupSubmit)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signin">
          <Card>
            <CardContent className="p-0">
              <SignInForm
                form={signInForm}
                onSubmit={signInForm.handleSubmit(handleSignInSubmit)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Auth;
