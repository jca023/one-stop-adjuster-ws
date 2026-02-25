import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import TestimonialsPage from './pages/TestimonialsPage';
import MobileAppPage from './pages/MobileAppPage';
import ResourcesPage from './pages/ResourcesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ClientPortalPage from './pages/ClientPortalPage';
import PolicyholderPortalPage from './pages/PolicyholderPortalPage';
import AdjusterPortalPage from './pages/AdjusterPortalPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import SecurityPage from './pages/SecurityPage';
import EulaPage from './pages/EulaPage';

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <div className="noise-overlay" />
        <ScrollToTop />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/mobile-app" element={<MobileAppPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/portal/client" element={<ClientPortalPage />} />
            <Route path="/portal/policyholder" element={<PolicyholderPortalPage />} />
            <Route path="/portal/adjuster" element={<AdjusterPortalPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/security-guidelines" element={<SecurityPage />} />
            <Route path="/mobile-app-eula" element={<EulaPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
