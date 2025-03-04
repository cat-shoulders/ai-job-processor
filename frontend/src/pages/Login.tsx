import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authClient } from '@/lib/auth-client';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginProps {
  onLogin: () => void;
}

const { signIn } = authClient;

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      console.log('Logged in', localStorage.getItem('authToken'));
      onLogin();
    }
  }, [onLogin]);

  const handleLogin = async ({ email, password }: LoginFormValues) => {
    signIn.email({
      email,
      password,
      fetchOptions: {
        onResponse: () => {
          setIsLoading(false);
        },
        onRequest: () => {
          setIsLoading(true);
        },
        onError: (ctx) => {
          toast({
            title: 'Error!',
            description: ctx.error.message,
            variant: 'destructive',
          });
        },
        onSuccess: async (data) => {
          console.log('Logged in', data);
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('userEmail', email);
          toast({
            title: 'Login successful',
            description: 'Welcome back to JobHunter!',
          });
          onLogin();
        },
      },
    });

    // setIsLoading(true);
    //
    // try {
    //   const response = await fetch(import.meta.env.VITE_API_URL + '/api/login', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ email, password }),
    //   });
    //
    //   const data = await response.json();
    //
    //   if (response.ok) {
    //     localStorage.setItem('authToken', data.token);
    //     localStorage.setItem('userEmail', email);
    //     toast({
    //       title: 'Login successful',
    //       description: 'Welcome back to JobHunter!',
    //     });
    //     onLogin();
    //   } else {
    //     toast({
    //       title: 'Login failed',
    //       description: data.message || 'Login failed',
    //     });
    //   }
    // } catch (e) {
    //   toast({
    //     title: 'Error!',
    //     description: 'An error occurred. Please try again.',
    //     variant: 'destructive',
    //   });
    //   console.error(e);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="w-screen flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Briefcase className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">JobHunter</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleLogin)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/*<Button variant="link" className="h-auto p-0 text-sm">*/}
                {/*  Forgot password?*/}
                {/*</Button>*/}
              </div>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" className="h-auto p-0">
                Sign up
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
