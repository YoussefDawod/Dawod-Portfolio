/**
 * Section Transitions â€” Pure Functions fÃ¼r Section-Wechsel
 * Berechnet neue Animation-Tokens basierend auf Scroll-Richtung
 */

import { createHomeTokens, convertHomeTokensToAbout } from '../sections/home/tokens.js';
import { convertAboutToHome } from '../sections/about/convert.js';
import { createProjectsForms } from '../sections/projects/index.js';
import { createContactNodes } from '../sections/contact/index.js';

const SECTION_ORDER = ['YD', 'ABOUT', 'PROJECTS', 'CONTACT'];
const SECTION_MODES = { YD: 'home', ABOUT: 'about', PROJECTS: 'projects', CONTACT: 'contact' };

/**
 * Berechnet neue Tokens + Modus fÃ¼r einen Section-Wechsel.
 * @returns {{ mode: string, tokens: Array|Object, justReturned: boolean }}
 */
function computeSectionTransition(prevSection, newSection, prevTokens) {
    const prevIdx = SECTION_ORDER.indexOf(prevSection);
    const newIdx = SECTION_ORDER.indexOf(newSection);
    const isForward = newIdx > prevIdx;
    const mode = SECTION_MODES[newSection] || 'home';

    switch (newSection) {
        case 'YD': {
            let prev;
            if (prevSection === 'ABOUT' && !isForward) {
                prev = convertAboutToHome(prevTokens);
            } else if (prevSection === 'CONTACT') {
                // BGS-Tausch: Contact rendert das Projects-Grid (Forms-State).
                // â†’ saubere Re-Creation, kein Token-Array zum Konvertieren.
                prev = [];
            } else {
                prev = prevTokens;
            }
            const tokens = createHomeTokens({ previousTokens: prev });
            return { mode, tokens, justReturned: true };
        }
        case 'ABOUT': {
            let tokens;
            if (prevSection === 'YD' && isForward) {
                tokens = convertHomeTokensToAbout(prevTokens);
            } else if (prevSection === 'PROJECTS' && !isForward) {
                // BGS-Tausch: Projects rendert Linien-Tokens (kein Forms-State).
                // â†’ frische Home-Tokens â†’ Chaos-Konvertierung.
                tokens = convertHomeTokensToAbout(createHomeTokens());
            } else {
                tokens = convertHomeTokensToAbout(createHomeTokens({ previousTokens: prevTokens }));
            }
            return { mode, tokens, justReturned: false };
        }
        case 'PROJECTS': {
            // BGS-Tausch: Projects-Bereich rendert das Linien-Token-System.
            return { mode, tokens: createContactNodes({ previousTokens: [] }), justReturned: false };
        }
        case 'CONTACT':
            // BGS-Tausch: Contact-Bereich rendert das Projects-Grid.
            return { mode, tokens: createProjectsForms({ previousTokens: [] }), justReturned: false };
        default:
            return { mode: 'home', tokens: createHomeTokens({ previousTokens: prevTokens }), justReturned: false };
    }
}

/**
 * VollstÃ¤ndiger Section-Wechsel: Aktualisiert scrollRef und berechnet Tokens.
 * @returns {null|{ mode: string, tokens: Array|Object, justReturned: boolean }}
 */
export function handleSectionChange(newSection, scrollRef, tokensRef, animationModeRef) {
    const prevSection = scrollRef.current.currentSection;
    if (prevSection === newSection) return null;

    // Scroll-Referenzdaten fÃ¼r neue Section
    const sectionEl = document.querySelector(`section[data-section="${newSection}"]`);
    if (sectionEl) {
        const rect = sectionEl.getBoundingClientRect();
        scrollRef.current.sectionScrollStart = rect.top + window.scrollY;
        scrollRef.current.sectionHeight = rect.height;
    }

    const result = computeSectionTransition(prevSection, newSection, tokensRef.current);

    animationModeRef.current = result.mode;
    tokensRef.current = result.tokens;
    scrollRef.current.currentSection = newSection;

    if (result.justReturned) {
        scrollRef.current.justReturned = true;
    } else {
        scrollRef.current.justReturned = false;
    }

    return result;
}
