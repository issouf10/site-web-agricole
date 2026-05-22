<?php
require_once 'config/database.php';

// Démarrer la session si ce n'est pas déjà fait
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Rediriger si l'utilisateur est déjà connecté
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header("location: dashboard.php");
    exit;
}

$nom = $email = $password = $confirm_password = "";
$nom_err = $email_err = $password_err = $confirm_password_err = "";
$registration_success = "";

// Générer un jeton CSRF
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];


if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Validation du nom
    if (empty(trim($_POST["nom"]))) {
        $nom_err = "Veuillez entrer votre nom.";
    } else {
        $nom = trim($_POST["nom"]);
    }

    // Vérification du jeton CSRF
    if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        // Gérer l'échec de la validation CSRF, par exemple, journaliser, rediriger ou afficher une erreur
        die('Erreur de sécurité : Jeton CSRF invalide.');
    }
    // Le jeton est valide, on peut le supprimer pour éviter la réutilisation
    unset($_SESSION['csrf_token']);

    // Validation de l'email
    if (empty(trim($_POST["email"]))) {
        $email_err = "Veuillez entrer une adresse email.";
    } elseif (!filter_var(trim($_POST["email"]), FILTER_VALIDATE_EMAIL)) {
        $email_err = "Veuillez entrer une adresse email valide.";
    }else {
        // Préparer une requête SELECT
        $sql = "SELECT id FROM users WHERE email = ?";

        if ($conn && $stmt = mysqli_prepare($conn, $sql)) {
            mysqli_stmt_bind_param($stmt, "s", $param_email);
            $param_email = trim($_POST["email"]);

            if (mysqli_stmt_execute($stmt)) {
                mysqli_stmt_store_result($stmt);

                if (mysqli_stmt_num_rows($stmt) == 1) {
                    $email_err = "Cet email est déjà utilisé.";
                } else {
                    $email = trim($_POST["email"]);
                }
            } else {
                echo "Oops! Une erreur est survenue lors de la vérification de l'email. Veuillez réessayer plus tard.";
                exit; // Arrêter l'exécution en cas d'erreur critique
            }
            mysqli_stmt_close($stmt);
        }
    }

    // Validation du mot de passe
    if (empty(trim($_POST["password"]))) {
        $password_err = "Veuillez entrer un mot de passe.";
    } elseif (strlen(trim($_POST["password"])) < 8) {
        $password_err = "Le mot de passe doit contenir au moins 8 caractères.";
    } else {
        $password = trim($_POST["password"]);
    }

    // Validation de la confirmation du mot de passe
    if (empty(trim($_POST["confirm_password"]))) {
        $confirm_password_err = "Veuillez confirmer le mot de passe.";
    } else {
        $confirm_password = trim($_POST["confirm_password"]);
        if (empty($password_err) && ($password != $confirm_password)) {
            $confirm_password_err = "Les mots de passe ne correspondent pas.";
        }
    }

    // Vérifier les erreurs avant d'insérer dans la base de données
    if ($conn && empty($nom_err) && empty($email_err) && empty($password_err) && empty($confirm_password_err)) {

        // Préparer une requête INSERT
        $sql = "INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, 'agriculteur')";

        if ($stmt = mysqli_prepare($conn, $sql)) {
            mysqli_stmt_bind_param($stmt, "sss", $param_nom, $param_email, $param_password);

            // Définir les paramètres
            $param_nom = $nom;
            $param_email = $email;
            $param_password = password_hash($password, PASSWORD_DEFAULT); // Hachage du mot de passe

            // Tenter d'exécuter la requête préparée
            if (mysqli_stmt_execute($stmt)) {
                $registration_success = "Compte créé avec succès ! Vous pouvez maintenant vous connecter.";
                // Rediriger vers la page de connexion après l'inscription
                header("location: login.html");
                exit;
            } else {
                echo "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer plus tard.";
            }
            mysqli_stmt_close($stmt);
        }
    }

    // Fermer la connexion
    if ($conn) {
        mysqli_close($conn);
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription - AgroConnect</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="navbar">
        <h1 class="logo">🌱 AgriConnect</h1>
        <ul class="nav-links">
            <li><a href="index.html">Accueil</a></li>
            <li><a href="features.html">Fonctionnalités</a></li>
            <li><a href="login.html">Connexion</a></li>
            <li><a href="register.html">Inscription</a></li>
        </ul>
    </nav>

    <section class="auth-section">
        <div class="auth-form">
            <img src="images/community.jpg" alt="AgriConnect" style="width:100%; border-radius:10px; margin-bottom:15px; height:150px; object-fit:cover;">
            <h1>Rejoignez AgroConnect</h1>
            <p>Créez votre compte pour gérer vos activités agricoles.</p>

            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <div class="form-group">
                    <label for="nom">Nom et Prénom</label>
                    <input type="text" id="nom" name="nom" value="<?php echo htmlspecialchars($nom); ?>" required>
                    <span class="error-msg" style="color:red; font-size:12px;"><?php echo $nom_err; ?></span>
                </div>

                <div class="form-group">
                    <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrf_token); ?>">
                    <label for="email">Adresse Email</label>
                    <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required>
                    <span class="error-msg" style="color:red; font-size:12px;"><?php echo $email_err; ?></span>
                </div>

                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" required>
                        <button type="button" class="toggle-password" data-target="password">Voir</button>
                    </div>
                    <span class="error-msg" style="color:red; font-size:12px;"><?php echo $password_err; ?></span>
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirmez le mot de passe</label>
                    <div class="password-wrapper">
                        <input type="password" id="confirm_password" name="confirm_password" required>
                        <button type="button" class="toggle-password" data-target="confirm_password">Voir</button>
                    </div>
                    <span class="error-msg" style="color:red; font-size:12px;"><?php echo $confirm_password_err; ?></span>
                </div>

                <div class="feedback-container">
                    <?php if (!empty($registration_success)): ?>
                        <div class="success-msg" style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                            <?php echo $registration_success; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <button type="submit" class="btn-submit">S'inscrire</button>
            </form>

            <p class="switch-form">Déjà inscrit ? <a href="login.html">Connectez-vous ici</a></p>
        </div>
    </section>

    <footer>
        <p>&copy; 2026 AgroConnect - Plateforme d'échange agricole</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>