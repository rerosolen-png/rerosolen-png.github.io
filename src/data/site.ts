/**
 * Fonte única de verdade para os dados da empresa (NAP: nome, endereço, telefone).
 *
 * Tudo que aparece no rodapé, na página de contato e nos dados estruturados
 * (schema.org) sai daqui. Para alterar um telefone ou horário, edite somente
 * este arquivo.
 *
 * Fontes: Receita Federal (CNPJ), Perfil da Empresa no Google, Instagram e
 * Facebook oficiais (levantamento de 28/10/2026).
 */

export interface OpeningHours {
  /** Dias da semana no formato schema.org (Monday, Tuesday, ...). */
  days: string[];
  /** Rótulo em português para exibição. */
  label: string;
  opens: string;
  closes: string;
}

export const site = {
  name: 'Rosolen Têxtil',
  legalName: 'Rosolen - Comércio de Malhas e Tecidos Ltda',
  cnpj: '08.877.663/0001-09',
  tagline: 'Loja de tecidos em Ribeirão Preto desde 1995',
  /** Domínio definitivo. Mantenha igual ao `site` do astro.config.mjs. */
  url: 'https://www.rosolentextil.com.br',
  locale: 'pt_BR',
  description:
    'A Rosolen Têxtil é uma das mais tradicionais lojas de tecidos de Ribeirão Preto. Desde 1995 na Avenida da Saudade, vende tecidos planos e malhas nacionais e importados por metro, no varejo e no atacado para confecções.',
  foundingYear: 1995,

  phone: '+55 16 3961-3969',
  phoneDisplay: '(16) 3961-3969',
  whatsapp: '5516997473969',
  whatsappDisplay: '(16) 99747-3969',
  email: 'rosolentextil@rosolentextil.com.br',

  address: {
    street: 'Avenida da Saudade',
    number: '891',
    complement: '',
    neighborhood: 'Campos Elíseos',
    city: 'Ribeirão Preto',
    state: 'SP',
    stateName: 'São Paulo',
    postalCode: '14080-000',
    country: 'BR',
  },

  geo: { latitude: -21.1643325, longitude: -47.8035177 },

  /** Perfil da Empresa no Google (Place ID ChIJOfcYrFS-uZQRe-4m_KFfTxk). */
  mapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJOfcYrFS-uZQRe-4m_KFfTxk',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=Rosolen+T%C3%AAxtil+Tecidos,+Avenida+da+Saudade,+891,+Ribeir%C3%A3o+Preto&output=embed',

  social: {
    instagram: 'https://www.instagram.com/rosolentextil/',
    facebook: 'https://www.facebook.com/rosolentextil/',
  },

  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      label: 'Segunda a sexta',
      opens: '08:00',
      closes: '18:00',
    },
    { days: ['Saturday'], label: 'Sábado', opens: '08:00', closes: '13:00' },
  ] as OpeningHours[],

  priceRange: '$',

  /** Loja irmã, no mesmo quarteirão. */
  sisterStore: {
    name: 'Rosolen Decorações',
    address: 'Avenida da Saudade, 881 - Campos Elíseos, Ribeirão Preto - SP',
    phoneDisplay: '(16) 3289-6160',
    description: 'Tecidos para decoração, tapeçaria, cortinas, TNT, tule e artesanato.',
  },

  /** Imagem padrão para compartilhamento em redes sociais (1200x630). */
  defaultOgImage: '/og-default.jpg',
} as const;

export type Site = typeof site;

/** Endereço em uma linha, para exibição. */
export function formatAddress(): string {
  const a = site.address;
  const complement = a.complement ? `, ${a.complement}` : '';
  return `${a.street}, ${a.number}${complement} - ${a.neighborhood}, ${a.city} - ${a.state}, CEP ${a.postalCode}`;
}

/** Link direto para conversa no WhatsApp com mensagem inicial. */
export function whatsappLink(
  message = 'Olá! Vim pelo site da Rosolen Têxtil e gostaria de um orçamento.'
): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Telefone em formato E.164 para links tel:. */
export function telLink(): string {
  return `tel:${site.phone.replace(/[^+\d]/g, '')}`;
}
