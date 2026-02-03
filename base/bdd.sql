CREATE DATABASE garage;
USE garage;
CREATE TABLE client(
    idClient INT AUTO_INCREMENT PRIMARY KEY,
    nomPrenoms VARCHAR(250),
    adresse VARCHAR(250)
);
CREATE TABLE marqueVoiture(
    idMarque INT AUTO_INCREMENT PRIMARY KEY,
    marque VARCHAR(250)
);
CREATE TABLE voiture(
    idVoiture INT AUTO_INCREMENT PRIMARY KEY,
    idClient INT,
    modeleVoiture VARCHAR(250),
    idMarqueVoiture INT,
    FOREIGN KEY (idClient) REFERENCES client(idClient),
    FOREIGN KEY (idMarqueVoiture) REFERENCES client(idClient)
);