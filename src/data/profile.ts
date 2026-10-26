export type Language = 'pt-BR' | 'en';
type Translation = Record<Language, string>;
interface Contact {
  id: string;
  name: string;
  href: string;
  description: Translation;
}
export const profile = {
  name: 'Gabriel Pereira Coelho',
  initials: 'GC',
  photo: '/images/profile.jpg',
  role: { 'pt-BR': 'Pesquisador em IA Generativa · Mestrando em Computação', en: 'Generative AI Researcher · MSc Student in Computer Science' } satisfies Translation,
};
export const copy = {
  'pt-BR': {
    language: 'Idioma da página', contacts: 'Perfis de contato',
    photo: 'Foto de Gabriel Pereira Coelho', initials: 'Gabriel Pereira Coelho, iniciais GC',
    outgoing: 'Visitar perfil', email: 'Enviar e-mail',
    description: 'Gabriel Pereira Coelho · Pesquisador em IA Generativa · Mestrando em Computação. Encontre meus contatos.',
  },
  en: {
    language: 'Page language', contacts: 'Contact profiles',
    photo: 'Portrait of Gabriel Pereira Coelho', initials: 'Gabriel Pereira Coelho, initials GC',
    outgoing: 'Visit profile', email: 'Send email',
    description: 'Gabriel Pereira Coelho · Generative AI Researcher · MSc Student in Computer Science. Find my contacts.',
  },
};
export const contacts: Contact[] = [
  { id: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/in/gabriel-p-coelho/', description: { 'pt-BR': 'Conexões profissionais', en: 'Professional connections' } },
  { id: 'github', name: 'GitHub', href: 'https://github.com/gabrielpcoelho', description: { 'pt-BR': 'Código e projetos', en: 'Code and projects' } },
  { id: 'email', name: 'E-mail', href: 'mailto:gabrielpereiracoelho18@gmail.com', description: { 'pt-BR': 'gabrielpereiracoelho18@gmail.com', en: 'gabrielpereiracoelho18@gmail.com' } },
];
