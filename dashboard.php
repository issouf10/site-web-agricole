<?php
session_start();
// Inclure le fichier de configuration de la base de données
require_once 'config/database.php';

// Vérifier si l'utilisateur est connecté, sinon redirection vers login
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de bord - AgroConnect</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php if (!$conn): ?>
        <div style="background: #f8d7da; color: #721c24; padding: 15px; text-align: center;">
            <strong>Erreur :</strong> Cette page nécessite une base de données active. Veuillez configurer XAMPP.
        </div>
    <?php endif; ?>
    <nav class="navbar">
        <div class="logo">Agro<span>Connect</span></div>
        <ul class="nav-links">
            <li><a href="index.php">Accueil</a></li>
            <li><a href="index.php#market">Marché</a></li>
            <li><a href="logout.php" class="btn-login">Déconnexion</a></li>
        </ul>
    </nav>

    <main class="container">

    <main class="main-content">
        <header style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Bienvenue, <?php echo htmlspecialchars($_SESSION["nom"]); ?></h1>
            <a href="add_product.php" class="btn-add">+ Publier un produit</a>
        </header>

        <div class="product-grid">
            <?php
            // Récupérer les produits de l'utilisateur connecté
            $user_id = $_SESSION["id"];
            $sql = "SELECT id, nom, description, prix, quantite, unite, image_url FROM products WHERE user_id = ?";
            
            if ($conn && $stmt = mysqli_prepare($conn, $sql)) {
                mysqli_stmt_bind_param($stmt, "i", $user_id);
                if (mysqli_stmt_execute($stmt)) {
                    $result = mysqli_stmt_get_result($stmt);
                    if (mysqli_num_rows($result) > 0) {
                        while ($row = mysqli_fetch_assoc($result)) {
                            echo '<div class="product-card">';
                            echo '<div class="product-image">';
                            if (!empty($row['image_url'])) {
                                echo '<img src="' . htmlspecialchars($row['image_url']) . '" alt="' . htmlspecialchars($row['nom']) . '">';
                            } else {
                                echo '<img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400" alt="Image par défaut">';
                            }
                            echo '</div>';
                            echo '<div class="product-info">';
                            echo '<h3>' . htmlspecialchars($row['nom']) . '</h3>';
                            echo '<p>Stock : ' . htmlspecialchars($row['quantite']) . ' ' . htmlspecialchars($row['unite']) . '</p>';
                            echo '<p class="price">' . htmlspecialchars(number_format($row['prix'], 0, ',', ' ')) . ' FCFA / ' . htmlspecialchars($row['unite']) . '</p>';
                            echo '<div style="display: flex; gap: 10px; margin-top: 15px;">';
                            echo '<a href="edit_product.php?id=' . $row['id'] . '" class="btn-submit btn-modify" style="flex: 1;">Modifier</a>';
                            echo '<form action="delete_product.php" method="post" onsubmit="return confirm(\'Êtes-vous sûr de vouloir supprimer ce produit ?\');" style="flex: 1; margin: 0;">';
                            echo '<input type="hidden" name="product_id" value="' . $row['id'] . '">';
                            echo '<button type="submit" class="btn-submit btn-delete">Supprimer</button>';
                            echo '</form>';
                            echo '</div>';
                            echo '</div>';
                            echo '</div>'; // Ferme product-card
                        }
                    } else {
                        echo '<div style="text-align: center; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-top: 20px;">';
                        echo '<p>Vous n\'avez pas encore publié de produits.</p>';
                        echo '<a href="add_product.php" class="btn-submit" style="width: auto; padding: 10px 20px;">Cliquez ici pour en ajouter un.</a>';
                        echo '</div>';
                    }
                } else {
                    echo '<p class="error-msg">Erreur lors de la récupération de vos produits.</p>';
                }
                mysqli_stmt_close($stmt);
            } else if (!$conn) {
                echo '<p>Le mode démonstration est actif. Connectez la base de données pour voir vos produits.</p>';
            }
            ?>
        </div>

        <section style="margin-top: 40px;">
            <h2 class="section-title">Messages de clients</h2>
            <div class="product-grid"> <!-- Utilisation de product-grid pour un affichage similaire -->
                <div class="product-card">
                    <h3>Client : Jean Dupont</h3>
                    <p>"Bonjour, je souhaiterais commander 10kg de tomates..."</p>
                    <a href="mailto:jean@email.com" class="btn-submit btn-modify">Répondre par email</a>
                </div>
            </div>
        </section>
    </main>
</body>
</html>
<?php
// Fermer la connexion à la base de données
if ($conn) {
    mysqli_close($conn);
}
?>