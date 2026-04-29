import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre espace client AutoShip DZ.',
};

export default function LoginPage() {
  return <LoginClient />;
}
