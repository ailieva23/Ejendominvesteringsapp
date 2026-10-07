import { hentBBR, bbrData } from "./bbr.js";

// hentet fra DAWA-guide (https://dawadocs.dataforsyningen.dk/dok/guide/autocomplete)
// tilpasset af gruppen
// Vi har bare kopiede koden fra DAWAs officielle guide, men vi tilpassede koden så, den gemmer og bruger adressens id.
// Vi skal bruge denne adresse id senere til at finde data fra BBR API'et

let valgtAdresseId = null; // Opretter en variabel til at gemme den valgte adresse ID

document.addEventListener("DOMContentLoaded", function () {  // Her venter vi bare på at siden er helt loadet før vi kører koden.

    dawaAutocomplete.dawaAutocomplete(
        document.getElementById("adresse"),  // adresse er id'en af vores inputfelt. 
        {
            select: function (selected) {  // denne funktion kører når brugeren har valgt adressen.
                if (document.getElementById("valgtadresse")) {
                    document.getElementById("valgtadresse").innerHTML = selected.tekst; // viser den valgte adresse til brugeren.
                }
                console.log("Valgt adresse:", selected); // bare en console log til at se om alt virker korrekt. 
                valgtAdresseId = selected.data.id;
                console.log("Valgt adresse ID:", valgtAdresseId); // console log for at se om id'en gemmes rigtigt. 
                hentBBR(valgtAdresseId); // Her bruger vi hentBBR() funktionen fra bbr.js til at hente oplysnigner om den valgte bolig. 
                // Dataen gemmes derefter i databasen efter brugeren trykker på gem (hentBBR logik)
            }
        }
    );

});
