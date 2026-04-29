import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte AutoShip DZ pour suivre vos commandes et réserver des visites.',
};

export default function RegisterPage() {
  return <RegisterClient />;
}
