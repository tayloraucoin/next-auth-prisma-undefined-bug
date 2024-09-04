import SignUpForm from '@/components/app/auth/SignUpForm';
import AuthFormWrapper from '@/components/app/auth/AuthFormWrapper';

export default function SignInPage() {
  return (
    <AuthFormWrapper title="Sign In">
      <SignUpForm />
    </AuthFormWrapper>
  );
}
