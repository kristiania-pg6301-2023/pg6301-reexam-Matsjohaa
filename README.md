github-classroom link: https://github.com/kristiania-pg6301-2023/pg6301-reexam-Matsjohaa

deployment link: 

siden jeg ble ferdig med bacheloren min ifjor, og tar opp dette faget på siden for å forbedre karakteren min, så har jeg ikke lenger github sudent developer pack gratis, og får heller ikke gratis credits på heroku. jeg prøvde å søke på å fornye pakken, men ble rejected to ganger:

![image](https://github.com/user-attachments/assets/02148630-c3e0-4157-9e23-bcbc0c7dbc7e)


siden oppgaven hadde som krav å ha tre roller, valgte jeg å løse det sånn her:
- gjester kan se innlegg, kommentarer og reaksjoner
- google-brukere kan se innlegg og kommentarer + reagere på innlegg
- github-brukere kan legge ut innlegg + kommentere på innlegg + reagere på innlegg 



## Funksonelle krav:
* [x] Anonyme brukere skal se de siste innleggene og reaksjoner (emojis) når de kommer til nettsiden (lag noen eksempelinnlegg for å demonstrere)
* [x] Brukere kan logge seg inn. Du kan velge brukere skal kunne registrere seg med brukere skal logge inn med Google eller Entra ID
* [x] En bruker som er logget inn kan se på sin profilside
* [x] Brukere skal forbli logget inn når de refresher websiden
* [x] en bruker som er logget inn kan klikke på et innlegg for hvem som har reagert på innlegget og kommentarer. Detaljene skal inkludere en overskrift, tekst, navn og bilde (om tilgjengelig) på den som publiserte den
* [x] Brukere kan publisere nye innlegg. Innlegg skal være mellom 10 ord og 1000 tegn (regnet med at mener mellom 10 og 1000 tegn, og ikke ord. )
* [x] systemet hindrer en bruker fra å publisere mer enn 5 innlegg innefor en time
* [x] brukeren skal forhindres å sende inn en nyhetsatikkel som mangler tekst (tolker som at du mener innlegg)
* [x] en bruker skal kunne redigere et innleg de selv har publisert
* [x] en bruker skal kunne slette et innlegg de selv har publisert
* [x] brukere skal reakere på andres innlegg med en av flere emojis
* [x] valgfritt: brukere kan legge til kommentarer til andres innlegg (+ slette. ikke fikset redigering på kommentarer)
* [ ] valgfritt Brukere kan legge til andre som venner
* [x] Alle feil fra serves skal presenters på en pen måte, med mulighet til å prøve igjen

## må-krav
* [ ] read-me fil skal inneholde link til heroku og test coverage
* [ ] npm start skal starte server og klient. cocurenntly og vite anbefales
* [x] koden skal ha konsistent formattering. prettier og husky anbefales
* [x] nettsiden skal ha god layout med css grid og horisontal navigasjonsmeny. brukeren skal kunne navigere overalt uten å bruke "back eller redigere url"
* [x] serveren validerer at brukeren er logget inn
* [ ] innlevering i zip-fil
* [x] Data skal lagres i MongoDB
* [ ] applikasjonen skal deployes til Heroku
* [ ] testene skal kjøre på github actions

## bør krav
* [x] brukere kan logge seg på mer enn en openID connect Provider (github)



[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/nHPSu_dn)
