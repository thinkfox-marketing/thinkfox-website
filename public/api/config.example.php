<?php
/**
 * Vorlage für api/config.php (auf dem Server anlegen, NICHT ins Git einchecken).
 * cp config.example.php config.php und Werte anpassen.
 */
return [
    // Zufälliger, langer Wert – signiert die Formular-Tokens
    'secret' => 'BITTE-AENDERN-' . 'mindestens-32-zeichen-zufall',

    'mail' => [
        'from' => 'website@thinkfox.de',      // Absender (muss zur Domain/zum SMTP-Konto passen)
        'from_name' => 'thinkfox.de',
    ],

    // Leer lassen, um PHP mail() des Hosters zu verwenden
    'smtp' => [
        'host' => '',                          // z. B. smtp.example.de
        'port' => 587,
        'secure' => 'tls',                     // 'tls' (STARTTLS, 587) oder 'ssl' (465)
        'user' => '',
        'pass' => '',
    ],

    // Je Forminator-Formular-ID: Empfänger, Betreff, Pflichtfelder und Verhalten nach dem Absenden
    // ('redirect' => URL leitet weiter, sonst wird 'message' im Formular angezeigt)
    'forms' => [
        '11213' => [ // Projekt anfragen
            'to' => ['hallo@thinkfox.de'],
            'subject' => 'Neue Projektanfrage über thinkfox.de',
            'required' => ['checkbox-1', 'checkbox-2', 'radio-2', 'text-1', 'email-1', 'consent-1'],
            'redirect' => '/danke_projektanfrage/',
        ],
        '12432' => [ // Marketing-Check
            'to' => ['hallo@thinkfox.de'],
            'subject' => 'Neuer Marketing-Check über thinkfox.de',
            'required' => ['name-2', 'select-1', 'select-2', 'name-1', 'email-1', 'consent-1'],
            'redirect' => '/marketing-check-ergebnis/',
            'company_field' => 'name-2',
            // Bereiche und zugehörige Fragen (gleiche Formeln wie die Berechnungsfelder im Formular)
            'scores' => [
                'website_seo' => ['checkbox-1', 'checkbox-2', 'checkbox-3'],
                'content_social' => ['checkbox-4', 'checkbox-5', 'checkbox-6'],
                'strategie' => ['checkbox-7', 'checkbox-8'],
                'recruiting' => ['checkbox-9', 'checkbox-10'],
                'ganzheit' => ['checkbox-11', 'checkbox-12', 'checkbox-13'],
            ],
        ],
        '13090' => [ // Mietstudio
            'to' => ['hallo@thinkfox.de'],
            'subject' => 'Neue Mietstudio-Anfrage über thinkfox.de',
            'required' => ['name-1', 'email-1', 'consent-1'],
            'message' => '<p>Vielen Dank für deine Anfrage! Wir melden uns schnellstmöglich bei dir.</p>',
        ],
        '7075' => [ // 360-Grad-Rundgänge
            'to' => ['hallo@thinkfox.de'],
            'subject' => 'Neue Anfrage 360-Grad-Rundgang über thinkfox.de',
            'required' => ['name-1', 'email-1', 'consent-1'],
            'message' => '<p>Vielen Dank für deine Anfrage! Wir melden uns schnellstmöglich bei dir.</p>',
        ],
    ],
];
