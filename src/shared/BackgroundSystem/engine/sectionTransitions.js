/**
 * Section Transitions — Pure Functions für Section-Wechsel
 * Berechnet neue Animation-Tokens basierend auf Scroll-Richtung
 */

import { createHomeTokens, convertHomeTokensToAbout } from '../sections/home/tokens.js';
import { convertAboutToHome, convertAboutToProjects } from '../sections/about/convert.js';
import { createProjectsForms, convertProjectsToAbout } from '../sections/projects/index.js';
import { createContactNodes, convertContactToProjects } from '../sections/contact/index.js';

export const SECTION_ORDER = ['YD', 'ABOUT', 'PROJECTS', 'CONTACT'];
const SECTION_MODES = { YD: 'home', ABOUT: 'about', PROJECTS: 'projects', CONTACT: 'contact' };

/**
 * Berechnet neue Tokens + Modus für einen Section-Wechsel.
 * @returns {{ mode: string, tokens: Array|Object, justReturned: boolean }}
 */
export function computeSectionTransition(prevSection, newSection, prevTokens) {
    const prevIdx = SECTION_ORDER.indexOf(prevSection);
    const newIdx = SECTION_ORDER.indexOf(newSection);
    const isForward = newIdx > prevIdx;
    const mode = SECTION_MODES[newSection] || 'home';

    switch (newSection) {
        case 'YD': {
            const tokens = (prevSection === 'ABOUT' && !isForward)
                ? createHomeTokens({ previousTokens: convertAboutToHome(prevTokens) })
                : createHomeTokens({ previousTokens: prevTokens });
            return { mode, tokens, justReturned: true };
        }
        case 'ABOUT': {
            let tokens;
            if (prevSection === 'YD' && isForward) {
                tokens = convertHomeTokensToAbout(prevTokens);
            } else if (prevSection === 'PROJECTS' && !isForward) {
                tokens = convertProjectsToAbout(prevTokens);
            } else {
                tokens = convertHomeTokensToAbout(createHomeTokens({ previousTokens: prevTokens }));
            }
            return { mode, tokens, justReturned: false };
        }
        case 'PROJECTS': {
            let prev;
            if (prevSection === 'ABOUT' && isForward) {
                prev = convertAboutToProjects(prevTokens);
            } else if (prevSection === 'CONTACT' && !isForward) {
                prev = convertContactToProjects(prevTokens);
            } else {
                prev = prevTokens;
            }
            return { mode, tokens: createProjectsForms({ previousTokens: prev }), justReturned: false };
        }
        case 'CONTACT':
            return { mode, tokens: createContactNodes({ previousTokens: prevTokens }), justReturned: false };
        default:
            return { mode: 'home', tokens: createHomeTokens({ previousTokens: prevTokens }), justReturned: false };
    }
}

/**
 * Vollständiger Section-Wechsel: Aktualisiert scrollRef und berechnet Tokens.
 * @returns {null|{ mode: string, tokens: Array|Object, justReturned: boolean }}
 */
export function handleSectionChange(newSection, scrollRef, tokensRef, animationModeRef) {
    const prevSection = scrollRef.current.currentSection;
    if (prevSection === newSection) return null;

    // Scroll-Referenzdaten für neue Section
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
