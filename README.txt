COMPONENTĂ GLOBALĂ „SUSȚINE PROIECTUL” — VARIANTA 2

Fișiere necesare:
- js/support.js
- thank-you.html

1. Copiază folderul js în proiectul tău.
2. Copiază thank-you.html în rădăcina proiectului, lângă index.html.
3. În fiecare pagină HTML, înainte de </body>, adaugă:

   <script src="js/support.js"></script>

4. Alternativ, pune toate paginile HTML în același folder cu fișierul
   integreaza_in_toate_paginile.py și rulează:

   python integreaza_in_toate_paginile.py

FLUX:
- Utilizatorul apasă „Donează prin Revolut”.
- Revolut se deschide într-un tab nou.
- În panel apare întrebarea „Ai finalizat donația?”.
- „Da, am donat” deschide thank-you.html.
- „Nu încă” închide fereastra și utilizatorul rămâne pe pagina curentă.
- Din thank-you.html, utilizatorul revine exact pe pagina de unde a început.

IMPORTANT:
Revolut.me nu confirmă automat tranzacția. Mesajul de mulțumire apare pe baza
confirmării utilizatorului, nu pe baza unei verificări API.

Link Revolut configurat:
https://revolut.me/mariomihail
