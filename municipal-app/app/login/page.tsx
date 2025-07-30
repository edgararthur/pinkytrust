'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated and redirect (only once)
  useEffect(() => {
    let hasRedirected = false;

    const checkAuth = async () => {
      if (hasRedirected) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session && !hasRedirected) {
        hasRedirected = true;
        console.log('User already authenticated, redirecting...');

        // Force immediate redirect for production reliability
        if (session.user.email === 'supervisor@municipal.gov') {
          window.location.replace('/super-admin');
        } else {
          window.location.replace('/dashboard');
        }
      }
    };

    checkAuth();
  }, []);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      console.log('Starting login...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login completed:', { data: !!data, error: !!error });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Login successful!');

        // Force immediate redirect using window.location.replace to prevent back button issues
        if (email === 'supervisor@municipal.gov') {
          window.location.replace('/super-admin');
        } else {
          window.location.replace('/dashboard');
        }
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background with medical pattern */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-700" />

        {/* Medical pattern overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.4) 2px, transparent 2px),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 2px, transparent 2px),
              radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.2) 2px, transparent 2px),
              linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%)
            `,
            backgroundSize: '60px 60px, 80px 80px, 100px 100px, 40px 40px, 40px 40px',
            backgroundPosition: '0 0, 30px 30px, 60px 60px, 0 0, 20px 20px'
          }}
        />

        {/* Medical cross pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 35px,
                rgba(255, 255, 255, 0.1) 35px,
                rgba(255, 255, 255, 0.1) 37px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 35px,
                rgba(255, 255, 255, 0.1) 35px,
                rgba(255, 255, 255, 0.1) 37px
              )
            `
          }}
        />

        {/* Floating medical icons */}
        <div className="absolute inset-0 overflow-hidden">
          <Heart className="absolute top-20 left-20 h-8 w-8 text-white/10 animate-pulse" />
          <Heart className="absolute top-40 right-32 h-6 w-6 text-white/15 animate-pulse" style={{ animationDelay: '1s' }} />
          <Heart className="absolute bottom-32 left-40 h-10 w-10 text-white/10 animate-pulse" style={{ animationDelay: '2s' }} />
          <Heart className="absolute bottom-20 right-20 h-7 w-7 text-white/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Heart className="absolute top-60 left-1/2 h-5 w-5 text-white/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Floating medical icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 opacity-10 animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div className="absolute top-40 right-20 opacity-10 animate-pulse delay-1000">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="absolute bottom-32 left-20 opacity-10 animate-pulse delay-2000">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-10 animate-pulse delay-500">
            <Heart className="h-7 w-7 text-white" />
          </div>
          <div className="absolute top-1/2 left-5 opacity-10 animate-pulse delay-1500">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div className="absolute top-1/3 right-5 opacity-10 animate-pulse delay-3000">
            <Heart className="h-9 w-9 text-white" />
          </div>
        </div>

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-sm opacity-90 shadow-2xl"></div>
              <div className="relative bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/30">
                <Heart className="h-16 w-16 text-pink-600" />
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              GI-KACE
            </h1>
            <p className="text-white/90 font-medium drop-shadow-md">
              Municipal Breast Cancer Awareness Platform
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 h-12 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>



              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Municipal Breast Cancer Awareness Platform
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Secure access for authorized personnel only
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <div className="text-center">
          <p className="text-white/70 text-sm">
            For technical support, contact the system administrator
          </p>
        </div>
      </div>
    </div>
  );
}