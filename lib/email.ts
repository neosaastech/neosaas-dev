// lib/email.ts
import nodemailer from 'nodemailer';

// Configuration du transporteur SMTP (réutilisable)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'neosaas.tech',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true, // Port 465 = SSL/TLS obligatoire
  auth: {
    user: process.env.EMAIL_USER || 'contact@neosaas.tech',
    pass: process.env.EMAIL_PASSWORD, // À définir dans .env.local
  },
  tls: {
    // Désactive la vérification des certificats auto-signés (dev uniquement)
    rejectUnauthorized: process.env.NODE_ENV === 'development',
  },
});

/**
 * Envoie un e-mail via SMTP.
 * @param to Destinataire (ex: "user@example.com")
 * @param subject Sujet de l'e-mail
 * @param html Contenu HTML de l'e-mail
 * @param replyTo Adresse de réponse (optionnelle)
 * @returns Promise avec les infos d'envoi
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
) {
  try {
    const mailOptions = {
      from: '"NeoSaas" <contact@neosaas.tech>',
      to,
      subject,
      html,
      ...(replyTo && { replyTo }), // Ajoute replyTo si fourni
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé (ID: %s)', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Échec envoi e-mail:', error);
    throw new Error('Impossible d’envoyer l’e-mail. Vérifiez la configuration SMTP.');
  }
}

/**
 * Envoie un e-mail de test pour vérifier la configuration SMTP.
 * @returns Promise avec le résultat du test
 */
export async function testSMTPConnection() {
  try {
    // Envoie un e-mail de test à l'adresse définie dans .env (ou une adresse par défaut)
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    if (!testEmail) throw new Error('Aucune adresse de test configurée.');

    const info = await transporter.sendMail({
      from: '"NeoSaas" <contact@neosaas.tech>',
      to: testEmail,
      subject: '✅ Test SMTP NeoSaas',
      html: `
        <h1>Test SMTP réussi</h1>
        <p>Votre configuration SMTP fonctionne correctement.</p>
        <p>Envoyé depuis <strong>NeoSaas</strong> (${new Date().toLocaleString()}).</p>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Test SMTP échoué:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
