import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. On récupère TOUTES les infos envoyées par le frontend (y compris la date)
    const { email, nom, sujet, corps, dateProgrammee } = await request.json();

    if (!process.env.BREVO_API_KEY) {
      console.error("ERREUR : La clé BREVO_API_KEY est manquante dans .env.local");
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: "Mon CRM Immo", email: "mandadabo590@gmail.com" }, 
        to: [{ email: email, name: nom }],
        subject: sujet,
        htmlContent: `<html><body>${corps}</body></html>`,
        // 2. On ajoute la date de programmation SEULEMENT si elle existe
        ...(dateProgrammee ? { scheduledAt: dateProgrammee } : {})
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({ message: 'Email envoyé ou programmé !' });
    } else {
      console.error("Erreur détaillée Brevo:", result);
      return NextResponse.json({ error: result }, { status: response.status });
    }
  } catch (error) {
    console.error("Erreur Serveur:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}