'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const [formData, setFormData] = useState({
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validToken, setValidToken] = useState<boolean | null>(null);

	useEffect(() => {
		// Check if we have valid session from password reset link
		const checkSession = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setValidToken(!!session);
		};

		checkSession();
	}, []);

	const validatePassword = (password: string): string | null => {
		if (password.length < 8) {
			return 'Password must be at least 8 characters long';
		}
		if (!/(?=.*[a-z])/.test(password)) {
			return 'Password must contain at least one lowercase letter';
		}
		if (!/(?=.*[A-Z])/.test(password)) {
			return 'Password must contain at least one uppercase letter';
		}
		if (!/(?=.*\d)/.test(password)) {
			return 'Password must contain at least one number';
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		// Validate password strength
		const passwordError = validatePassword(formData.password);
		if (passwordError) {
			setError(passwordError);
			setLoading(false);
			return;
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password: formData.password,
			});

			if (error) {
				throw error;
			}

			setSuccess(true);
			
			// Redirect to sign in after 3 seconds
			setTimeout(() => {
				router.push('/auth/signin?message=Password updated successfully');
			}, 3000);
		} catch (err: any) {
			setError(err.message || 'Failed to update password. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	if (validToken === null) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (validToken === false) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<Card>
						<CardContent className="p-6 text-center">
							<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								Invalid or Expired Link
							</h2>
							<p className="text-gray-600 mb-4">
								This password reset link is invalid or has expired.
							</p>
							<div className="space-y-3">
								<Link href="/auth/forgot-password">
									<Button className="w-full">
										Request New Reset Link
									</Button>
								</Link>
								<Link href="/auth/signin">
									<Button variant="outline" className="w-full">
										Back to Sign In
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<Card>
						<CardContent className="p-6 text-center">
							<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								Password Updated Successfully
							</h2>
							<p className="text-gray-600 mb-4">
								Your password has been updated. You will be redirected to the sign in page shortly.
							</p>
							<Link href="/auth/signin">
								<Button className="w-full">
									Continue to Sign In
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900">
						Municipal Health Platform
					</h1>
					<p className="mt-2 text-gray-600">
						Breast Cancer Awareness & Support
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-center">Set New Password</CardTitle>
						<p className="text-center text-sm text-gray-600">
							Enter your new password below.
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<Alert type="error">
									<span>{error}</span>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="password">New Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										required
										value={formData.password}
										onChange={handleChange}
										placeholder="Enter new password"
										className="pl-10 pr-10"
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
										disabled={loading}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								<div className="text-xs text-gray-500 space-y-1">
									<p>Password must contain:</p>
									<ul className="list-disc list-inside space-y-1">
										<li>At least 8 characters</li>
										<li>One uppercase letter</li>
										<li>One lowercase letter</li>
										<li>One number</li>
									</ul>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm New Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										required
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Confirm new password"
										className="pl-10 pr-10"
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
										disabled={loading}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={loading || !formData.password || !formData.confirmPassword}
							>
								{loading ? (
									<>
										<LoadingSpinner size="sm" className="mr-2" />
										Updating Password...
									</>
								) : (
									'Update Password'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
