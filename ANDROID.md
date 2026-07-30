# Panel Mafie pentru Android

Acesta este proiectul mobil separat. Site-ul web original nu este modificat.

## Configurare obligatorie Discord

În Discord Developer Portal, la aplicația folosită de panel, adaugă exact următorul OAuth2 Redirect URI:

`discord-1531023771211792384:/authorize/callback`

## Comenzi

- `npm install` instalează dependențele.
- `npm run android:sync` regenerează conținutul web și îl sincronizează cu Android.
- `npm run android:open` deschide proiectul în Android Studio.
- `npm run android:build:debug` generează APK-ul de test.
- `npm run android:build:release` generează pachetul AAB pentru Google Play.

Compilarea cere JDK 21 și Android SDK API 36. Scriptul inclus folosește automat JDK-ul local din `.tools/jdk21` și SDK-ul instalat în profilul Windows.

## Semnarea pentru Google Play

Cheia de semnare nu se păstrează în Git. Release-ul se configurează local în Android Studio sau prin variabile CI protejate.
