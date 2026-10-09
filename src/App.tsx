import { SessionProvider } from './state/SessionContext';
import { AppShell } from './app-shell/AppShell';
import { SmoothScroll } from './ui/SmoothScroll';

export default function App() {
  return (
    <SmoothScroll>
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </SmoothScroll>
  );
}
