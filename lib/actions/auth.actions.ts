'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName } })

        if(response) {
            await inngest.send({
                name: 'app/user.created',
                data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
            })
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign up failed', e)
        return { success: false, error: 'Sign up failed' }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        return { success: false, error: 'Sign in failed' }
    }
}

export const requestPasswordReset = async ({ email }: ForgotPasswordFormData) => {
    try {
        const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL}/reset-password`;

        await auth.api.requestPasswordReset({ body: { email, redirectTo } })

        // Always report success so we don't reveal whether an email is registered
        return { success: true }
    } catch (e) {
        console.log('Request password reset failed', e)
        return { success: true }
    }
}

export const resetPassword = async ({ token, password }: { token: string; password: string }) => {
    try {
        await auth.api.resetPassword({ body: { token, newPassword: password } })

        return { success: true }
    } catch (e) {
        console.log('Reset password failed', e)
        return { success: false, error: e instanceof Error ? e.message : 'Reset password failed' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }
}