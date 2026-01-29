<user_journey_analysis>
1. Ścieżki użytkownika (z PRD i codebase):
   - **Rejestracja (US-001):** Nowy użytkownik wchodzi na stronę, wypełnia formularz rejestracji (email/hasło), zostaje zalogowany i *natychmiast* przekierowany do uzupełnienia preferencji podróżnych.
   - **Logowanie (US-002):** Powracający użytkownik wchodzi na stronę logowania, podaje dane, po sukcesie trafia do Dashboardu (Panelu Głównego).
   - **Odzyskiwanie Hasła (US-011):** Użytkownik zapomniał hasła -> klika "Zapomniałem hasła" -> podaje email -> otrzymuje link -> klika w link -> ustawia nowe hasło -> loguje się.
   - **Niezalogowany Użytkownik:** Widzi Stronę Główną (Landing Page), ale dostęp do Dashboardu i Planowania wymaga autentykacji.

2. Główne podróże i stany:
   - **Gość:** StronaGłówna -> Logowanie/Rejestracja.
   - **Autentykacja:** Formularz Logowania / Formularz Rejestracji.
   - **Onboarding:** Uzupełnienie Profilu (po rejestracji).
   - **Użytkownik Zalogowany:** Dashboard (Panel Główny) -> Generowanie Planu.
   - **Odzyskiwanie:** Żądanie Resetu -> Wysłanie Maila -> Zmiana Hasła.

3. Punkty decyzyjne i alternatywy:
   - Poprawne/Błędne dane logowania.
   - Poprawne/Błędne dane rejestracji (np. hasła się nie zgadzają, użytkownik istnieje).
   - Czy użytkownik jest nowy? (Tak -> Profil, Nie -> Dashboard).

4. Opis stanów:
   - **StronaStartowa:** Punkt wejścia dla niezalogowanych. Prezentacja funkcji.
   - **ModulAutentykacji:** Kontener obsługujący Logowanie i Rejestrację.
   - **Logowanie:** Proces weryfikacji poświadczeń.
   - **Rejestracja:** Proces tworzenia konta.
   - **ProfilUzytkownika:** Ekran ustawień preferencji (wymagany po rejestracji).
   - **PanelGlowny:** Główny widok aplikacji (Dashboard) z listą planów.
   - **ProcesResetuHasla:** Ścieżka odzyskiwania dostępu.
</user_journey_analysis>

<mermaid_diagram>
```mermaid
stateDiagram-v2
    [*] --> StronaStartowa
    
    state "Strona Główna (Landing Page)" as StronaStartowa
    StronaStartowa --> ModulAutentykacji: Kliknięcie "Zaloguj" / "Dołącz"

    state "Moduł Autentykacji" as ModulAutentykacji {
        state WyborAkcji <<choice>>
        
        [*] --> WyborAkcji
        WyborAkcji --> Logowanie: Posiada konto
        WyborAkcji --> Rejestracja: Nowy użytkownik

        state "Logowanie" as Logowanie {
            [*] --> FormularzLogowania
            FormularzLogowania --> WeryfikacjaDanych
            
            state if_poprawne_login <<choice>>
            WeryfikacjaDanych --> if_poprawne_login
            if_poprawne_login --> SukcesLogowania: Dane poprawne
            if_poprawne_login --> BladLogowania: Błąd danych
            
            BladLogowania --> FormularzLogowania: Spróbuj ponownie
            
            FormularzLogowania --> OdzyskiwanieHasla: Zapomniałem hasła
        }

        state "Rejestracja" as Rejestracja {
            [*] --> FormularzRejestracji
            note right of FormularzRejestracji
                Wymagane: Email i Hasło
                (min. 6 znaków)
            end note
            
            FormularzRejestracji --> WalidacjaRejestracji
            
            state if_poprawne_reg <<choice>>
            WalidacjaRejestracji --> if_poprawne_reg
            if_poprawne_reg --> TworzenieKonta: Walidacja OK
            if_poprawne_reg --> BladRejestracji: Błąd (np. hasła niezgodne)
            
            BladRejestracji --> FormularzRejestracji
            TworzenieKonta --> ProfilUzytkownika: Bezpośrednie przekierowanie
        }
    }

    state "Proces Odzyskiwania Hasła" as OdzyskiwanieHasla {
        [*] --> FormularzEmail
        FormularzEmail --> WyslanieLinku
        WyslanieLinku --> OczekiwanieNaEmail
        OczekiwanieNaEmail --> FormularzResetu: Kliknięcie w link z maila
        FormularzResetu --> ZapisanieNowegoHasla
        ZapisanieNowegoHasla --> [*]: Hasło zmienione
    }

    OdzyskiwanieHasla --> ModulAutentykacji: Powrót do logowania

    state "Obszar Chroniony" as ObszarChroniony {
        state "Konfiguracja Profilu" as ProfilUzytkownika
        note right of ProfilUzytkownika
            Wymagane po rejestracji:
            - Styl podróży
            - Zainteresowania
        end note

        state "Panel Główny (Dashboard)" as PanelGlowny
        
        state if_nowy_user <<choice>>
        
        [*] --> if_nowy_user
        if_nowy_user --> ProfilUzytkownika: Pierwsze logowanie (po rejestracji)
        if_nowy_user --> PanelGlowny: Powracający użytkownik
        
        ProfilUzytkownika --> PanelGlowny: Zapisanie preferencji
    }

    SukcesLogowania --> ObszarChroniony
    
    PanelGlowny --> [*]: Wylogowanie
```
</mermaid_diagram>
