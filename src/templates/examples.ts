/**
 * Exemples d'utilisation des templates
 * Ce fichier montre comment utiliser les templates dans votre code
 */

import {
  getVerificationEmailTemplate,
  getVerificationWhatsAppTemplate,
  getEmailTemplate,
  getWhatsAppTemplate,
  replaceVariables,
  listTemplates,
  validateTemplate,
} from '@/lib/templates';

// ============================================
// Exemple 1 : Email de vérification
// ============================================
export function sendVerificationEmail(email: string, code: string) {
  // Méthode simple avec helper
  const { html, text } = getVerificationEmailTemplate(code);

  console.log('HTML:', html);
  console.log('Text:', text);

  // Ensuite, envoyer l'email avec votre service préféré
  // await sendEmail({
  //   to: email,
  //   subject: 'Code de vérification - Marché241',
  //   html,
  //   text,
  // });
}

// ============================================
// Exemple 2 : WhatsApp de vérification
// ============================================
export function sendVerificationWhatsApp(phone: string, code: string) {
  // Version normale
  const message = getVerificationWhatsAppTemplate(code);
  console.log('Message WhatsApp:', message);

  // Version courte
  const shortMessage = getVerificationWhatsAppTemplate(code, true);
  console.log('Message WhatsApp court:', shortMessage);

  // Ensuite, envoyer via WhatsApp API
  // await sendWhatsApp({
  //   to: phone,
  //   message,
  // });
}

// ============================================
// Exemple 3 : Utilisation manuelle des templates
// ============================================
export function manualTemplateUsage() {
  // Charger un template email manuellement
  const { html, text } = getEmailTemplate('verification-code', {
    CODE: '123456',
  });

  // Charger un template WhatsApp manuellement
  const whatsappMessage = getWhatsAppTemplate('verification-code', {
    CODE: '1234',
  });

  return { html, text, whatsappMessage };
}

// ============================================
// Exemple 4 : Remplacement de variables personnalisées
// ============================================
export function customVariables() {
  const template = `
    Bonjour {{NAME}},
    
    Votre code est : {{CODE}}
    Valable jusqu'à : {{EXPIRY}}
  `;

  const result = replaceVariables(template, {
    NAME: 'Jean Dupont',
    CODE: '123456',
    EXPIRY: '15:30',
  });

  console.log(result);
  return result;
}

// ============================================
// Exemple 5 : Validation de template
// ============================================
export function validateMyTemplate() {
  const template = `Votre code : {{CODE}}, expire dans {{TIME}}`;
  
  const validation = validateTemplate(template, ['CODE', 'TIME', 'NAME']);
  
  if (!validation.valid) {
    console.error('Variables manquantes:', validation.missing);
    // Output: Variables manquantes: ['NAME']
  }

  return validation;
}

// ============================================
// Exemple 6 : Lister tous les templates
// ============================================
export function getAllTemplates() {
  const templates = listTemplates();
  
  console.log('Templates Email:', templates.email);
  // Output: ['verification-code.html', 'verification-code.txt']
  
  console.log('Templates WhatsApp:', templates.whatsapp);
  // Output: ['verification-code.txt', 'verification-code-short.txt']

  return templates;
}

// ============================================
// Exemple 7 : Utilisation dans une API Route Next.js
// ============================================
export async function exampleApiRoute(req: any, res: any) {
  const { email, phone, code } = req.body;

  try {
    if (email) {
      // Envoyer par email
      const { html, text } = getVerificationEmailTemplate(code);
      
      // Votre logique d'envoi d'email ici
      // await emailService.send({ to: email, html, text });
      
      res.status(200).json({ success: true, method: 'email' });
    } else if (phone) {
      // Envoyer par WhatsApp
      const message = getVerificationWhatsAppTemplate(code, true);
      
      // Votre logique d'envoi WhatsApp ici
      // await whatsappService.send({ to: phone, message });
      
      res.status(200).json({ success: true, method: 'whatsapp' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification code' });
  }
}

// ============================================
// Exemple 8 : Utilisation côté serveur (API Backend)
// ============================================
export async function backendExample() {
  // Dans votre backend Node.js/Express
  const code = '123456';
  const userEmail = 'user@example.com';

  // 1. Générer le template
  const { html, text } = getVerificationEmailTemplate(code);

  // 2. Envoyer avec Nodemailer (exemple)
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({...});
  // 
  // await transporter.sendMail({
  //   from: 'noreply@marche241.ga',
  //   to: userEmail,
  //   subject: 'Code de vérification - Marché241',
  //   html: html,
  //   text: text,
  // });

  // 3. Envoyer avec SendGrid (exemple)
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // 
  // await sgMail.send({
  //   to: userEmail,
  //   from: 'noreply@marche241.ga',
  //   subject: 'Code de vérification - Marché241',
  //   html: html,
  //   text: text,
  // });

  return { success: true };
}

// ============================================
// Exemple 9 : Gestion des erreurs
// ============================================
export function errorHandlingExample() {
  try {
    // Template qui n'existe pas
    const { html } = getEmailTemplate('non-existent', { CODE: '123' });
  } catch (error) {
    console.error('Template non trouvé:', error);
    // Utiliser un template de fallback ou un message par défaut
    const fallbackMessage = `Votre code de vérification est : 123456`;
    return fallbackMessage;
  }
}

// ============================================
// Exemple 10 : Tests
// ============================================
export function testTemplates() {
  // Test email template
  const emailTest = getVerificationEmailTemplate('TEST123456');
  console.assert(emailTest.html.includes('TEST123456'), 'Email HTML should contain code');
  console.assert(emailTest.text.includes('TEST123456'), 'Email text should contain code');

  // Test WhatsApp template
  const whatsappTest = getVerificationWhatsAppTemplate('TEST1234');
  console.assert(whatsappTest.includes('TEST1234'), 'WhatsApp should contain code');

  console.log('✅ All template tests passed');
}

// Exporter tout pour faciliter l'import
export default {
  sendVerificationEmail,
  sendVerificationWhatsApp,
  manualTemplateUsage,
  customVariables,
  validateMyTemplate,
  getAllTemplates,
  exampleApiRoute,
  backendExample,
  errorHandlingExample,
  testTemplates,
};

