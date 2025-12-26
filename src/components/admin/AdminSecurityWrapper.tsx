import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Admin Security Wrapper Component
 * - Adds noindex meta tags to prevent search engine crawling
 * - Validates admin access
 * - Adds security headers
 */
const AdminSecurityWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Add noindex meta tags for admin pages
  useEffect(() => {
    // Create noindex meta tag to block SEO crawlers
    const existingMeta = document.querySelector('meta[name="robots"][data-admin="true"]');
    if (!existingMeta) {
      const noindexMeta = document.createElement('meta');
      noindexMeta.name = 'robots';
      noindexMeta.content = 'noindex, nofollow, noarchive, nosnippet, noimageindex';
      noindexMeta.setAttribute('data-admin', 'true');
      document.head.appendChild(noindexMeta);

      const googleBotMeta = document.createElement('meta');
      googleBotMeta.name = 'googlebot';
      googleBotMeta.content = 'noindex, nofollow';
      googleBotMeta.setAttribute('data-admin', 'true');
      document.head.appendChild(googleBotMeta);
    }

    // Set document title without revealing admin status
    document.title = 'Dashboard | NOIR925';

    return () => {
      // Cleanup meta tags when leaving admin
      const adminMetas = document.querySelectorAll('meta[data-admin="true"]');
      adminMetas.forEach(meta => meta.remove());
      document.title = 'NOIR925 | Premium 925 Sterling Silver Jewellery';
    };
  }, [location]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect non-admins
  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default AdminSecurityWrapper;
