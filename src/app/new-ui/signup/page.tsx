import AuthScreen from '@/components/new-ui/AuthScreen';

export const metadata = {
  title: 'Sign Up - Encender',
  description: 'Create an Encender account for luxury curated gifting.',
};

export default function NewUISignUpPage() {
  return <AuthScreen initialMode="signup" />;
}
