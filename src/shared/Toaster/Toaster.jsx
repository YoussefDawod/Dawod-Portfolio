import { Toaster } from 'react-hot-toast';
import './toaster.css';

/**
 * Themed Wrapper um react-hot-toast.
 * Nutzt Design-Tokens (var(--surf), var(--txt), ...) statt hardcoded Werte.
 * Aria-Live wird von react-hot-toast intern korrekt gesetzt.
 */
const TOAST_STYLE = {
  background:   'var(--toast-bg)',
  boxShadow:    'var(--toast-shadow)',
  color:        'var(--txt)',
  borderRadius: 'var(--r-md)',
  padding:      '0.9rem 1.1rem',
  maxWidth:     '380px',
  lineHeight:   '1.5',
};

function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        className: 'app-toast',
        style: TOAST_STYLE,
        success: { className: 'app-toast app-toast--success', duration: 5000, style: TOAST_STYLE },
        error:   { className: 'app-toast app-toast--error',   duration: 6000, style: TOAST_STYLE },
      }}
    />
  );
}

export default AppToaster;
