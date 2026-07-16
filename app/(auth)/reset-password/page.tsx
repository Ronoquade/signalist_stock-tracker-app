import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

const ResetPassword = async ({ searchParams }: { searchParams: Promise<{ token?: string }> }) => {
    const { token } = await searchParams;

    return <ResetPasswordForm token={token ?? ''} />;
};
export default ResetPassword;
