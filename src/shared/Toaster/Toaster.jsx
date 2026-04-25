import { Toaster } from 'react-hot-toast';
import './toaster.css';

/**
 * Themed Wrapper um react-hot-toast.
 * Nutzt Design-Tokens (var(--surf), var(--txt), ...) statt hardcoded Werte.
 * Aria-Live wird von react-hot-toast intern korrekt gesetzt.
 */
function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        className: 'app-toast',
        success: { className: 'app-toast app-toast--success', duration: 5000 },
        error:   { className: 'app-toast app-toast--error',   duration: 6000 },
      }}
    />
  );
}

export default AppToaster;
