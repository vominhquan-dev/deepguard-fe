import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import { Landing } from './pages/Landing';
import { DashboardHome } from './pages/DashboardHome';
import { Dashboard } from './pages/Dashboard';
import { Results } from './pages/Results';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Pricing } from './pages/Pricing';
import { RealtimeMonitor } from './pages/RealtimeMonitor';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: 'dashboard', Component: DashboardHome },
      { path: 'detect', Component: Dashboard },
      { path: 'results', Component: Results },
      { path: 'history', Component: History },
      { path: 'analytics', Component: Analytics },
      { path: 'realtime', Component: RealtimeMonitor },
      { path: 'settings', Component: Settings },
      { path: 'about', Component: About },
      { path: 'privacy', Component: Privacy },
      { path: 'contact', Component: Contact },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'pricing', Component: Pricing },
      { path: '*', Component: NotFound },
    ],
  },
]);