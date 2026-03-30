// NotFoundPage — shown for unknown routes, and as a placeholder for unbuilt features.
// The optional `message` prop lets App.tsx show a "coming soon" message for stub routes.

import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { ROUTES } from '../constants/routes';

interface NotFoundPageProps {
  message?: string;
}

export default function NotFoundPage({ message }: NotFoundPageProps) {
  const isComingSoon = Boolean(message);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#f0f9ff] flex items-center justify-center mb-5">
        <Construction className="w-8 h-8 text-[#0891b2]" />
      </div>

      <h1 className="text-2xl font-bold text-[#0f172a] mb-2">
        {isComingSoon ? 'Coming Soon' : 'Page Not Found'}
      </h1>

      <p className="text-sm text-[#64748b] max-w-sm mb-6">
        {message ?? "We couldn't find the page you were looking for."}
      </p>

      <Link
        to={ROUTES.SCHEDULE}
        className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0891b2] text-white text-sm font-semibold rounded-xl hover:bg-[#0e7490] transition-colors"
      >
        Go to Schedule
      </Link>
    </div>
  );
}
