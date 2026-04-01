# Načrt uporabniškega testiranja (UAT) - EU Project Manager

Ta dokument vsebuje scenarije za uporabniško testiranje platforme EU Project Manager, pripravljene na podlagi tehnične specifikacije. Namenjen je zagotavljanju kakovosti pred končno objavo aplikacije.

## 1. Avtentikacija in dostop

| ID              | Scenarij                            | Pričakovani rezultat                                                                                                                        |
| :-------------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-AUTH-01** | Brskanje kot neprijavljen uporabnik | Uporabnik lahko vidi seznam projektov, podrobnosti projektov in splošno analitiko, nima pa dostopa do urejanja ali administratorske plošče. |
| **UAT-AUTH-02** | Prijava z demo računom (Editor)     | Po prijavi so vidni gumbi za urejanje, dodajanje projektov in KPI-jev. V glavi je viden naziv vloge "Editor".                               |
| **UAT-AUTH-03** | Prijava z demo računom (Super User) | Viden je element "Admin Panel" v navigaciji in vse možnosti urejanja.                                                                       |
| **UAT-AUTH-04** | Odjava iz sistema                   | Uporabnik se varno odjavi in vrne v način obiskovalca (brez pravic urejanja).                                                               |

## 2. Upravljanje projektov

| ID              | Scenarij                          | Pričakovani rezultat                                                                                           |
| :-------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **UAT-PROJ-01** | Ustvarjanje novega projekta       | Editor lahko izpolni vsa obvezna polja in shrani nov projekt, ki se nato pojavi na seznamu.                    |
| **UAT-PROJ-02** | Urejanje obstoječega projekta     | Spremembe v opisu, statusu ali vrednosti investicije se pravilno shranijo in prikažejo.                        |
| **UAT-PROJ-03** | Dodajanje interne opombe          | Avtenticiran uporabnik lahko doda opombo, ki je skrita za zunanje obiskovalce.                                 |
| **UAT-PROJ-04** | Iskanje in filtriranje            | Iskanje po imenu in napredni filtri (država, tip projekta, organizacija) pravilno omejijo prikazane rezultate. |
| **UAT-PROJ-05** | Priljubljeni projekti (Favorites) | Klik na srce doda projekt med priljubljene; filter "Favorites" deluje pravilno.                                |

## 3. Upravljanje KPI (Ključni kazalniki uspeha)

| ID             | Scenarij                           | Pričakovani rezultat                                                                               |
| :------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------- |
| **UAT-KPI-01** | Dodajanje vnaprej definiranega KPI | Ob izbiri indikatorja (npr. "CO2 reduction") se prikaže informacijska plošča z metodo izračuna.    |
| **UAT-KPI-02** | Dodajanje KPI po meri (Custom)     | Uporabnik lahko ročno vnese poljubno ime indikatorja.                                              |
| **UAT-KPI-03** | Nastavitev primarnega KPI          | Izbrani KPI z zvezdico se pravilno prikaže na kartici projekta na osnovni strani (moder poudarek). |
| **UAT-KPI-04** | Urejanje vrednosti KPI             | Sprememba dosežene vrednosti takoj posodobi vrstico napredka (barvna koda: zelena/modra/rdeča).    |

## 4. Analitika in poročanje

| ID            | Scenarij                              | Pričakovani rezultat                                                                                              |
| :------------ | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| **UAT-AN-01** | Splošna analitika (General Analytics) | Prikaz vseh grafov (države, statusi, investicije) deluje za vse uporabnike.                                       |
| **UAT-AN-02** | Organizacijska analitika              | Dostopna samo prijavljenim; podatki so filtrirani glede na izbrano organizacijo.                                  |
| **UAT-AN-03** | Prilagajanje grafov                   | Uporabnik lahko vklopi/izklopi posamezne grafe v organizacijski analitiki; nastavitve se ohranijo (localStorage). |

## 5. Administracija (Samo Super User)

| ID             | Scenarij                        | Pričakovani rezultat                                                                                       |
| :------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------- |
| **UAT-ADM-01** | Povabilo novega uporabnika      | Super User lahko vnese podatke in pošlje povabilo (status "pending").                                      |
| **UAT-ADM-02** | Konfiguracija polj (Enums)      | Dodajanje novega tipa projekta ali organizacije se takoj pozna v spustnih seznamih pri urejanju projektov. |
| **UAT-ADM-03** | Preprečevanje podvojenih vnosov | Sistem javi napako (toast), če poskušamo dodati že obstoječo vrednost v šifrant.                           |

## 6. Uporabniška izkušnja in odzivnost

| ID            | Scenarij            | Pričakovani rezultat                                                                                          |
| :------------ | :------------------ | :------------------------------------------------------------------------------------------------------------ |
| **UAT-UX-01** | Mobilni prikaz      | Navigacija se na mobilnih napravah spremeni v drsni meni; kartice projektov so zložene navpično.              |
| **UAT-UX-02** | Oblikovanje številk | Denarne vrednosti so izpisane v formatu EUR z ustreznimi ločili (presledek za tisočice, vejica za decimalke). |
| **UAT-UX-03** | Obvestila (Toasts)  | Vsaka akcija (shranjevanje, brisanje, napaka) sproži vidno obvestilo v spodnjem kotu.                         |
