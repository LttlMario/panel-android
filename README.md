# Panel pentru Android

Aplicația Android separată pentru Panel. Versiunea web originală rămâne disponibilă la adresa sa actuală.

## Descărcare

APK-ul instalabil se găsește în secțiunea **Releases** a acestui repository. Descarcă fișierul `.apk`, deschide-l pe telefon și permite instalarea din sursa folosită de browser atunci când Android solicită acest lucru.

## Cerințe

- Android 7.0 sau o versiune mai nouă.
- Conexiune la internet pentru Supabase, Discord și resursele externe.
- Cont Discord cu acces la serverul configurat pentru panel.

## Dezvoltare

Instrucțiunile de compilare și configurare sunt în [ANDROID.md](ANDROID.md).

## Securitate

Tokenul Discord persistent este protejat cu Android Keystore. Aplicația blochează traficul HTTP necriptat și nu permite backupul datelor aplicației.
