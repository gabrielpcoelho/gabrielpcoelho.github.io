import { useEffect, useState } from 'react';
import { contacts, copy, profile } from './data/profile';
import type { Language } from './data/profile';

// Let long e-mail addresses wrap after the @ instead of mid-word.
const breakAfterAt = (text: string) => text.split('@').flatMap((part, i) => i ? ['@', <wbr key={i} />, part] : [part]);

export default function App() {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [photoState, setPhotoState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const text = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.querySelector('meta[name="description"]')?.setAttribute('content', text.description);
  }, [language, text.description]);

  return (
    <main className="contact-page">
      <div className="language-bar">
        <div className="language-selector" role="group" aria-label={text.language}>
          <button type="button" lang="pt-BR" aria-label="Português" aria-pressed={language === 'pt-BR'} onClick={() => setLanguage('pt-BR')}>PT</button>
          <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
        </div>
      </div>

      <header className="profile">
        <div className="avatar-frame">
          <div className="avatar">
            {photoState !== 'loaded' && <span className="initials" role="img" aria-label={text.initials}>{profile.initials}</span>}
            {photoState !== 'error' && (
              <img
                className={`portrait${photoState === 'loaded' ? ' is-loaded' : ''}`}
                src={profile.photo}
                alt={text.photo}
                width="112"
                height="112"
                onLoad={() => setPhotoState('loaded')}
                onError={() => setPhotoState('error')}
              />
            )}
          </div>
        </div>
        <h1>{profile.name}</h1>
        <p className="role">{profile.role[language]}</p>
      </header>

      <nav aria-label={text.contacts}>
        <ul className="contact-list">
          {contacts.map(contact => (
            <li key={contact.id}>
              <a className="contact-card" href={contact.href}>
                <span className={`service-icon service-icon--${contact.id}`} aria-hidden="true">
                  <img src={`/icons/${contact.id}.svg`} alt="" width="23" height="23" />
                </span>
                <span className="contact-copy">
                  <span className="service-name">{contact.name}</span>
                  <span className="service-description">{breakAfterAt(contact.description[language])}</span>
                </span>
                <span className="sr-only">{contact.href.startsWith('mailto:') ? text.email : text.outgoing}</span>
                <svg className="outgoing" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
