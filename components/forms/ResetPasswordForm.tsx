'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { resetPassword } from '@/lib/actions/auth.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const ResetPasswordForm = ({ token }: { token: string }) => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            const result = await resetPassword({ token, password: data.password });

            if (result.success) {
                toast.success('Password updated', {
                    description: 'You can now sign in with your new password.',
                });
                router.push('/sign-in');
            } else {
                toast.error('Reset failed', {
                    description: result.error || 'This reset link may have expired. Request a new one.',
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Reset failed', {
                description: e instanceof Error ? e.message : 'Failed to reset password.',
            });
        }
    };

    if (!token) {
        return (
            <>
                <h1 className="form-title">Invalid reset link</h1>
                <p className="text-sm text-gray-500 mb-6">
                    This password reset link is missing or invalid. Please request a new one.
                </p>
                <FooterLink text="Need a new link?" linkText="Reset password" href="/forgot-password" />
            </>
        );
    }

    return (
        <>
            <h1 className="form-title">Set a new password</h1>
            <p className="text-sm text-gray-500 mb-6">
                Choose a strong password you haven&apos;t used before.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="password"
                    label="New Password"
                    placeholder="Enter a strong password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } }}
                />

                <InputField
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    type="password"
                    register={register}
                    error={errors.confirmPassword}
                    validation={{
                        required: 'Please confirm your password',
                        validate: (value: string, formValues: ResetPasswordFormData) => value === formValues.password || 'Passwords do not match',
                    }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Updating' : 'Reset Password'}
                </Button>

                <FooterLink text="Remembered your password?" linkText="Sign in" href="/sign-in" />
            </form>
        </>
    );
};
export default ResetPasswordForm;
