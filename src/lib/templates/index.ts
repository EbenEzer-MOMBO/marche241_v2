/**
 * Helpers pour charger et utiliser les templates email et WhatsApp
 */

import fs from 'fs';
import path from 'path';

/**
 * Interface pour les variables de template
 */
export interface TemplateVariables {
  [key: string]: string | number;
}

/**
 * Types de templates disponibles
 */
export type TemplateType = 'email' | 'whatsapp';
export type EmailFormat = 'html' | 'txt';

/**
 * Charge un template depuis le système de fichiers
 * @param type - Type de template (email ou whatsapp)
 * @param name - Nom du template sans extension
 * @param format - Format pour les emails (html ou txt)
 * @returns Le contenu du template
 */
export function loadTemplate(
  type: TemplateType,
  name: string,
  format?: EmailFormat
): string {
  try {
    const extension = type === 'email' && format ? `.${format}` : '.txt';
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      type,
      `${name}${extension}`
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
}

/**
 * Remplace les variables dans un template
 * @param template - Contenu du template
 * @param variables - Objet avec les variables à remplacer
 * @returns Le template avec les variables remplacées
 */
export function replaceVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  });

  return result;
}

/**
 * Charge et remplit un template email en HTML
 * @param name - Nom du template
 * @param variables - Variables à remplacer
 * @returns HTML du template rempli
 */
export function getEmailTemplate(
  name: string,
  variables: TemplateVariables
): { html: string; text: string } {
  const htmlTemplate = loadTemplate('email', name, 'html');
  const textTemplate = loadTemplate('email', name, 'txt');

  return {
    html: replaceVariables(htmlTemplate, variables),
    text: replaceVariables(textTemplate, variables),
  };
}

/**
 * Charge et remplit un template WhatsApp
 * @param name - Nom du template
 * @param variables - Variables à remplacer
 * @param short - Utiliser la version courte si disponible
 * @returns Message WhatsApp formaté
 */
export function getWhatsAppTemplate(
  name: string,
  variables: TemplateVariables,
  short: boolean = false
): string {
  const templateName = short ? `${name}-short` : name;
  
  try {
    const template = loadTemplate('whatsapp', templateName);
    return replaceVariables(template, variables);
  } catch (error) {
    // Si la version courte n'existe pas, utiliser la version normale
    if (short) {
      const template = loadTemplate('whatsapp', name);
      return replaceVariables(template, variables);
    }
    throw error;
  }
}

/**
 * Helper spécifique pour le code de vérification par email
 * @param code - Code de vérification
 * @param prenom - Prénom de l'utilisateur (optionnel)
 * @returns HTML et texte pour l'email
 */
export function getVerificationEmailTemplate(code: string, prenom?: string) {
  return getEmailTemplate('verification-code', { 
    CODE: code,
    prenom: prenom || ''
  });
}

/**
 * Helper spécifique pour le code de vérification par WhatsApp
 * @param code - Code de vérification
 * @param short - Utiliser la version courte
 * @returns Message WhatsApp formaté
 */
export function getVerificationWhatsAppTemplate(
  code: string,
  short: boolean = false
) {
  return getWhatsAppTemplate('verification-code', { CODE: code }, short);
}

/**
 * Helper spécifique pour le code d'inscription par email
 * @param code - Code de vérification
 * @param prenom - Prénom de l'utilisateur
 * @returns HTML et texte pour l'email
 */
export function getInscriptionEmailTemplate(code: string, prenom: string) {
  return getEmailTemplate('inscription-code', { 
    CODE: code,
    prenom: prenom
  });
}

/**
 * Helper spécifique pour le code d'inscription par WhatsApp
 * @param code - Code de vérification
 * @param prenom - Prénom de l'utilisateur
 * @param short - Utiliser la version courte
 * @returns Message WhatsApp formaté
 */
export function getInscriptionWhatsAppTemplate(
  code: string,
  prenom: string,
  short: boolean = false
) {
  return getWhatsAppTemplate('inscription-code', { 
    CODE: code,
    prenom: prenom
  }, short);
}

/**
 * Helper spécifique pour l'email de compte validé
 * @param prenom - Prénom de l'utilisateur
 * @returns HTML et texte pour l'email
 */
export function getCompteValideEmailTemplate(prenom: string) {
  return getEmailTemplate('compte-valide', { 
    prenom: prenom
  });
}

/**
 * Helper spécifique pour le message WhatsApp de compte validé
 * @param prenom - Prénom de l'utilisateur
 * @param short - Utiliser la version courte
 * @returns Message WhatsApp formaté
 */
export function getCompteValideWhatsAppTemplate(
  prenom: string,
  short: boolean = false
) {
  return getWhatsAppTemplate('compte-valide', { 
    prenom: prenom
  }, short);
}

/**
 * Valide qu'un template contient toutes les variables requises
 * @param template - Contenu du template
 * @param requiredVariables - Liste des variables requises
 * @returns true si toutes les variables sont présentes
 */
export function validateTemplate(
  template: string,
  requiredVariables: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  requiredVariables.forEach((variable) => {
    if (!template.includes(`{{${variable}}}`)) {
      missing.push(variable);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Liste tous les templates disponibles
 * @returns Objet avec les templates disponibles par type
 */
export function listTemplates(): {
  email: string[];
  whatsapp: string[];
} {
  const emailPath = path.join(process.cwd(), 'src', 'templates', 'email');
  const whatsappPath = path.join(process.cwd(), 'src', 'templates', 'whatsapp');

  const emailFiles = fs.existsSync(emailPath)
    ? fs.readdirSync(emailPath).filter((f) => !f.startsWith('.'))
    : [];

  const whatsappFiles = fs.existsSync(whatsappPath)
    ? fs.readdirSync(whatsappPath).filter((f) => !f.startsWith('.'))
    : [];

  return {
    email: emailFiles,
    whatsapp: whatsappFiles,
  };
}

