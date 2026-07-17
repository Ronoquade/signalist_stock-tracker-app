'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { requestPasswordReset } from '@/lib/actions/auth.actions';
import { toast } from 'sonner';

const ForgotPassword = () => {
    const [submitted, setSubmitted] = useState(false);
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        defaultValues: {
            email: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await requestPasswordReset(data);
            setSubmitted(true);
        } catch (e) {
            console.error(e);
            toast.error('Something went wrong', {
                description: e instanceof Error ? e.message : 'Failed to send reset email.',
            });
        }
    };

    if (submitted) {
        return (
            <>
                <h1 className="form-title">Check your inbox</h1>
                <p className="text-sm text-gray-500 mb-6">
                    If an account exists for <span className="text-gray-300">{getValues('email')}</span>, we&apos;ve sent a link to reset your password. The link expires in 1 hour.
                </p>
                <FooterLink text="Remembered it?" linkText="Back to sign in" href="/sign-in" />
            </>
        );
    }

    return (
        <>
            <h1 className="form-title">Forgot your password?</h1>
            <p className="text-sm text-gray-500 mb-6">
                Enter the email associated with your account and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="contact@jsmastery.com"
                    register={register}
                    error={errors.email}
                    validation={{ required: 'Email is required', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Sending link' : 'Send reset link'}
                </Button>

                <FooterLink text="Remembered your password?" linkText="Sign in" href="/sign-in" />
            </form>
        </>
    );
};
export default ForgotPassword;
