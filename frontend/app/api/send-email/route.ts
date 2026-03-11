import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Récupération des données du frontend
    const { email, nom, sujet, corps, dateProgrammee } = await request.json();

    // Vérification de la clé API
    if (!process.env.BREVO_API_KEY) {
      console.error("ERREUR : La clé BREVO_API_KEY est manquante");
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    // 2. Préparation du payload (corps de la requête)
    const emailPayload: any = {
      sender: { 
        name: "Mon CRM Immo", 
        email: "mandadabo590@gmail.com" 
      },
      to: [{ email: email, name: nom }],
      subject: sujet,
      htmlContent: `<html><body>${corps}</body></html>`,
    };

    // 3. Gestion sécurisée de la date de programmation
    // On n'ajoute 'scheduledAt' que si la date est remplie, non vide et valide
    if (dateProgrammee && typeof dateProgrammee === 'string' && dateProgrammee.trim() !== "") {
      try {
        const dateObj = new Date(dateProgrammee);
        // Vérifie si la date est valide avant de convertir en ISO
        if (!isNaN(dateObj.getTime())) {
          emailPayload.scheduledAt = dateObj.toISOString();
        }
      } catch (e) {
        console.error("Format de date invalide ignoré:", dateProgrammee);
      }
    }

    // 4. Appel à l'API Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    // 5. Gestion de la réponse
    if (response.ok) {
      return NextResponse.json({ message: 'Email envoyé ou programmé !' });
    } else {
      // C'est ici que tu verras l'erreur précise dans tes logs Vercel/Terminal
      console.error("Erreur détaillée Brevo:", result);
      return NextResponse.json({ 
        error: "Erreur Brevo", 
        details: result 
      }, { status: response.status });
    }

  } catch (error) {
    console.error("Erreur Serveur Interne:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}