import { SessionProvider } from './state/SessionContext';
import { AppShell } from './app-shell/AppShell';
import { SmoothScroll } from './ui/SmoothScroll';
import { CookieNotice } from './analytics';

export default function App() {
  return (
    <SmoothScroll>
      <SessionProvider>
        <AppShell />
        <CookieNotice />
      </SessionProvider>
    </SmoothScroll>
  );
}
