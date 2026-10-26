import { useEffect, useState } from 'react';
import { copy, profile } from './data/profile';
import type { Language } from './data/profile';
import { qrCopy, qrTarget } from './data/qr';
import { prepareQrOffline } from './qr-offline';
import type { OfflineState } from './qr-offline';

export default function QrPage() {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [photoState, setPhotoState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [offline, setOffline] = useState<OfflineState>('preparing');
  const [attempt, setAttempt] = useState(0);
  const text = qrCopy[language];
  const shared = copy[language];
  useEffect(() => {
    document.documentElement.lang = language;
    document.querySelector('meta[name="description"]')?.setAttribute('content', text.description);
  }, [language, text.description]);
  useEffect(() => prepareQrOffline(setOffline), [attempt]);
  useEffect(() => {
    const retry = () => { if (offline === 'error') setAttempt(value => value + 1); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [offline]);

  return (
    <main className="contact-page qr-page">
      <div className="language-bar">
        <div className="language-selector" role="group" aria-label={shared.language}>
          <button type="button" lang="pt-BR" aria-label="Português" aria-pressed={language === 'pt-BR'} onClick={() => setLanguage('pt-BR')}>PT</button>
          <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
        </div>
      </div>
      <header className="profile qr-profile">
        <div className="avatar-frame"><div className="avatar">
          {photoState !== 'loaded' && <span className="initials" role="img" aria-label={shared.initials}>{profile.initials}</span>}
          {photoState !== 'error' && <img className={`portrait${photoState === 'loaded' ? ' is-loaded' : ''}`} src={profile.photo} width="112" height="112" alt={shared.photo} onLoad={() => setPhotoState('loaded')} onError={() => setPhotoState('error')} />}
        </div></div>
        <h1>{profile.name}</h1>
        <p className="role">{profile.role[language]}</p>
      </header>
      <section className="qr-card" aria-label={text.scan}>
        <p className="qr-instruction">{text.scan}</p>
        <img className="qr-code" src="/qr/code.svg" width="296" height="296" alt={text.qrAlt} />
        <p className="qr-address">{new URL(qrTarget).host}</p>
      </section>
      <a className="qr-contacts" href="/">
        {text.open}
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m9 5 7 7-7 7" /></svg>
      </a>
      <p className="offline-status" role="status">{text[offline]}</p>
      {offline === 'error' && <button className="qr-retry" type="button" onClick={() => setAttempt(value => value + 1)}>{text.retry}</button>}
      <details className="install-guide">
        <summary>{text.install}</summary>
        <p>{text.android}</p>
        <p>{text.iphone}</p>
      </details>
    </main>
  );
}
