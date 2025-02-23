import { SignupForm } from "../components/ui/sign-up";
import { SignInForm } from "../components/ui/sign-in";
import { authClient } from "../lib/auth-client";

function Auth() {
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
      }

      console.log("Sign in successful:", data);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <SignupForm onSubmit={handleSignupSubmit} />
      <SignInForm onSubmit={handleSignInSubmit} />
    </div>
  );
}

export default Auth;
