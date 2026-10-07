-- 1. FJERN GAMLE TABELLER (HVIS DE FINDES)
DROP TABLE IF EXISTS Ejendomsinvestering.Finansering;
DROP TABLE IF EXISTS Ejendomsinvestering.Drift;
DROP TABLE IF EXISTS Ejendomsinvestering.Renovering;
DROP TABLE IF EXISTS Ejendomsinvestering.Investeringscase;
DROP TABLE IF EXISTS Ejendomsinvestering.Ejendomsprofil;
DROP TABLE IF EXISTS Ejendomsinvestering.Ejendom;
DROP TABLE IF EXISTS Ejendomsinvestering.Konto;
DROP TABLE IF EXISTS Ejendomsinvestering.Bruger;

-- 2. OPRET TABELLER
CREATE TABLE Ejendomsinvestering.Bruger (
    idBruger INT IDENTITY (1, 1) PRIMARY KEY,
    navn VARCHAR(50),
    addresse VARCHAR(50),
    email VARCHAR(50),
    tlf INT,
    adgangskode VARCHAR(10)
);

CREATE TABLE Ejendomsinvestering.Konto (
    idKonto INT IDENTITY (1,1) PRIMARY KEY,
    idBruger INT,
    brugernavn VARCHAR(50),
    betalingsmetode VARCHAR(25),
    CONSTRAINT konto_bruger_FK FOREIGN KEY (idBruger) REFERENCES Ejendomsinvestering.Bruger (idBruger)
);

CREATE TABLE Ejendomsinvestering.Ejendom (
    idEjendom INT IDENTITY (1,1) PRIMARY KEY,
    ejendomstype VARCHAR(50),
    byggeaar INT,
    pris INT,
    boligareal INT,
    adresse VARCHAR(100),
    postnummer INT,
    energimaerke VARCHAR(5),
    tilgaengelighed VARCHAR(50),
    antal_vaerelser INT
);

CREATE TABLE Ejendomsinvestering.Ejendomsprofil (
    idEjendomsprofil INT IDENTITY (1,1) PRIMARY KEY,
    idEjendom INT,
    plantegning VARCHAR(2000),
    billeder VARCHAR(2000),
    CONSTRAINT profil_ejendom_FK FOREIGN KEY (idEjendom) REFERENCES Ejendomsinvestering.Ejendom (idEjendom)
);

CREATE TABLE Ejendomsinvestering.Investeringscase (
    idInvesteringscase INT IDENTITY (1,1) PRIMARY KEY,
    idEjendomsprofil INT,
    idKonto INT,
    pris INT,
    oprettelsesdato DATE,
    omkostninger INT,
    CONSTRAINT invest_profil_FK FOREIGN KEY (idEjendomsprofil) REFERENCES Ejendomsinvestering.Ejendomsprofil (idEjendomsprofil),
    CONSTRAINT invest_konto_FK FOREIGN KEY (idKonto) REFERENCES Ejendomsinvestering.Konto (idKonto)
);

CREATE TABLE Ejendomsinvestering.Finansering (
    idFinansering INT IDENTITY (1,1) PRIMARY KEY,
    idInvesteringscase INT,
    laanebeloeb INT,
    rente DECIMAL(4,2),
    loebetid INT,
    afdragsperiode INT,
    laantype VARCHAR(50),
    CONSTRAINT finans_invest_FK FOREIGN KEY (idInvesteringscase) REFERENCES Ejendomsinvestering.Investeringscase (idInvesteringscase)
);

CREATE TABLE Ejendomsinvestering.Renovering (
    idRenovering INT IDENTITY (1,1) PRIMARY KEY,
    idInvesteringscase INT,
    udgifter INT,
    tidspunkt DATE,
    CONSTRAINT renover_invest_FK FOREIGN KEY (idInvesteringscase) REFERENCES Ejendomsinvestering.Investeringscase (idInvesteringscase)
);

CREATE TABLE Ejendomsinvestering.Drift (
    idDrift INT IDENTITY (1,1) PRIMARY KEY,
    idEjendom INT,
    vedligeholdelse INT,
    forsikring INT,
    lejeindtaegt INT,
    CONSTRAINT drift_ejendom_FK FOREIGN KEY (idEjendom) REFERENCES Ejendomsinvestering.Ejendom (idEjendom)
);

