<?php
// Formulaire de contact — remplace le script Adobe Muse (form-u9251.php).
// Reprend le mécanisme d'envoi qui a fait ses preuves sur cet hébergement
// Strato (PHP 7.2) : mail() avec expéditeur sur le domaine du site et
// Reply-To vers le visiteur.

$DESTINATAIRE = 'brasserie.ledome@gmail.com';
$EXPEDITEUR   = 'brasserie@ledome.fr'; // adresse du domaine : nécessaire pour la délivrabilité

// Méthode POST obligatoire + pot de miel : le champ "site_web" est invisible
// pour les humains, seuls les robots le remplissent.
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !empty($_POST['site_web'])) {
    header('Location: /contact.html');
    exit;
}

$nom     = isset($_POST['nom']) ? trim($_POST['nom']) : '';
$email   = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// FILTER_VALIDATE_EMAIL rejette les retours à la ligne : protège aussi
// contre l'injection d'en-têtes via le Reply-To.
if ($nom === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /contact.html?erreur=champs#formulaire');
    exit;
}

$sujet = 'Message depuis le site ledome.fr';
$corps = 'Nom : ' . $nom . "\r\n"
       . 'Email : ' . $email . "\r\n\r\n"
       . $message . "\r\n\r\n"
       . "--\r\n"
       . 'Envoyé depuis le formulaire de contact de ledome.fr (IP ' . $_SERVER['REMOTE_ADDR'] . ')';

$entetes = 'From: ' . $EXPEDITEUR . "\r\n"
         . 'Reply-To: ' . $email . "\r\n"
         . 'Content-Type: text/plain; charset=utf-8' . "\r\n";

$envoye = @mail($DESTINATAIRE, $sujet, $corps, $entetes);

header('Location: ' . ($envoye ? '/merci.html' : '/contact.html?erreur=envoi#formulaire'));
exit;
