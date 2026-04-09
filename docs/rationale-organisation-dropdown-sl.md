# Upravljanje polja "Organizacija" - razlogi za odločitev

## Zakaj smo ohranili konfigurabilni spustni seznam

Spoštovani,

po pregledu zahteve za spremembo polja "Organizacija" v prosto besedilno vnosno polje vas želimo seznaniti z razlogi, zakaj smo se na začetku projekta odločili za konfigurabilni spustni seznam, ki ga upravlja super uporabnik.

### Ključni razlogi za obstoječo rešitev

**1. Celovitost podatkov (Data Integrity)**
Prosto besedilno polje bi omogočalo različne različice imen iste organizacije (npr. "ELES", "Eles", "eles d.o.o.", "Elektro-Slovenija"). To bi v analitiki ustvarilo umetno razdrobljenost podatkov in nezanesljive poročila.

**2. Uporabniška izkušnja v analitiki**
Organizacija je ključni filter v analitičnem pregledu. Če bi bilo polje prosto, bi se v filtru pojavila dolga lista neurejenih, podvojenih vnosov, kar bi onemogočilo smiselno analizo po organizacijah.

**3. Preprečevanje neurejenosti sistema**
Vsak uporabnik bi lahko ustvaril nove "organizacije" po svoji presoji. Sčasoma bi to vodilo v nepregledno bazo podatkov z desetkami ali stotimi podvojenimi/podobnimi vnosi.

**4. Uporabniška pot (UX Workflow)**
Sedanji potek dela je jasen:

- Super uporabnik najprej doda organizacijo v sistem
- Uredniki nato izberejo iz obstoječega seznama
- Analitika prikazuje konsistentne, združljive podatke

### Zaključek

Obstoječa rešitev zagotavlja:

- ✅ Enolična imena organizacij v sistemu
- ✅ Zanesljiva analitična poročila
- ✅ Pregleden in upravljiv sistem
- ✅ Enostaven filter brez podvojenih vnosov

Priporočamo, da ohranimo sedanji način dela, kjer super uporabnik upravlja seznam organizacij, kar zagotavlja kakovost podatkov in uporabnost analitičnega modula.

S spoštovanjem,  
Ekipa razvoja
