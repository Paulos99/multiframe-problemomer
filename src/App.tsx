import { SessionProvider } from './state/SessionContext';
import { AppShell } from './app-shell/AppShell';

export default function App() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}
