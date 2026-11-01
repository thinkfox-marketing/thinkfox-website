<?php
/**
 * GitHub-OAuth für Decap CMS (/admin/).
 * Ablauf: /admin öffnet dieses Skript im Popup → Weiterleitung zu GitHub → Rückkehr mit ?code=
 * → Code gegen Token tauschen → Token per postMessage an das CMS-Fenster übergeben.
 * Benötigt in api/config.php: 'github' => ['client_id' => …, 'client_secret' => …]
 * oder api/config-github.php (beim Deploy aus GitHub-Secrets erzeugt).
 * (GitHub → Settings → Developer settings → OAuth Apps, Callback-URL: https://<domain>/api/cms-auth.php)
 */

declare(strict_types=1);
session_start();
$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
$gh = $config['github'] ?? null;
// alternativ beim Deploy aus den GitHub-Secrets CMS_GITHUB_CLIENT_ID/-SECRET erzeugt (api/config-github.php)
if ((!$gh || empty($gh['client_id'])) && is_file(__DIR__ . '/config-github.php')) {
    $gh = require __DIR__ . '/config-github.php';
}
if (!$gh || empty($gh['client_id']) || empty($gh['client_secret'])) {
    http_response_code(500);
    exit('GitHub-OAuth ist nicht eingerichtet (api/config.php → github).');
}

if (!isset($_GET['code'])) {
    $_SESSION['cms_oauth_state'] = bin2hex(random_bytes(16));
    header('Location: https://github.com/login/oauth/authorize?' . http_build_query([
        'client_id' => $gh['client_id'],
        'scope' => $_GET['scope'] ?? 'repo,user',
        'state' => $_SESSION['cms_oauth_state'],
    ]));
    exit;
}

$status = 'error';
$content = ['message' => 'Anmeldung fehlgeschlagen.'];
if (hash_equals($_SESSION['cms_oauth_state'] ?? '', (string) ($_GET['state'] ?? ''))) {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Accept: application/json\r\nContent-Type: application/x-www-form-urlencoded\r\nUser-Agent: thinkfox-cms\r\n",
        'content' => http_build_query([
            'client_id' => $gh['client_id'],
            'client_secret' => $gh['client_secret'],
            'code' => $_GET['code'],
        ]),
        'timeout' => 15,
    ]]);
    $res = json_decode((string) @file_get_contents('https://github.com/login/oauth/access_token', false, $ctx), true);
    if (!empty($res['access_token'])) {
        $status = 'success';
        $content = ['token' => $res['access_token'], 'provider' => 'github'];
    }
}
unset($_SESSION['cms_oauth_state']);
$message = 'authorization:github:' . $status . ':' . json_encode($content);
?><!doctype html>
<html lang="de"><body>
<script>
  (function () {
    var message = <?= json_encode($message) ?>;
    function receive(e) {
      if (e.origin !== window.location.origin) return;
      window.opener.postMessage(message, e.origin);
      window.removeEventListener('message', receive);
    }
    window.addEventListener('message', receive, false);
    window.opener.postMessage('authorizing:github', window.location.origin);
  })();
</script>
</body></html>
