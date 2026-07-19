import * as React from 'react';
import { PasswordForm } from '../components/PasswordForm';
import { DeleteAccountSection } from '../components/DeleteAccountSection';

export const AccountPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PasswordForm />
      <DeleteAccountSection />
    </div>
  );
};
