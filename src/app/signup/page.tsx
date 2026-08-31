import AuthScreen from '@/components/new-ui/AuthScreen';

export const metadata = {
  title: 'Sign Up - Encender',
  description: 'Create an Encender account for luxury curated gifting.',
};

export default function SignUpPage() {
  return <AuthScreen initialMode="signup" />;
}
