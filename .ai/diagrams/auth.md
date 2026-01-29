<authentication_analysis>
1. **Przepływy autentykacji:**
   - **Dostęp do chronionej trasy:** Użytkownik próbuje wejść na stronę (np. `/dashboard`) bez sesji. Middleware przekierowuje do `/login`.
   - **Logowanie:** Użytkownik podaje dane w `LoginForm`. Żądanie POST do `/api/auth/login`. Weryfikacja w Supabase. Ustawienie ciasteczek sesyjnych. Przekierowanie do `/dashboard`.
   - **Rejestracja:** Użytkownik podaje dane w `RegisterForm`. Żądanie POST do `/api/auth/register`. Utworzenie użytkownika w Supabase. Automatyczne logowanie (zgodnie z `auth-spec.md` email confirmation disabled). Przekierowanie do `/profile`.
   - **Odświeżanie tokenu / Weryfikacja:** Middleware (`src/middleware/index.ts`) przy każdym zapytaniu inicjalizuje klienta Supabase i wywołuje `auth.getUser()`. Jeśli token wygasł, klient Supabase próbuje go odświeżyć (wewnętrznie).
   - **Wylogowanie:** Żądanie do `/api/auth/signout`. Usunięcie ciasteczek.

2. **Główni aktorzy:**
   - **Przeglądarka (Użytkownik):** Inicjuje żądania, wyświetla formularze.
   - **Middleware (Astro):** Pełni rolę strażnika, sprawdza sesję przy każdym żądaniu strony.
   - **Astro API (Backend):** Pośredniczy w komunikacji z Supabase dla logowania/rejestracji, chroniąc klucze i zarządzając ciasteczkami po stronie serwera.
   - **Supabase Auth:** Zewnętrzny dostawca tożsamości, przechowuje użytkowników, wystawia tokeny (JWT).

3. **Weryfikacja i odświeżanie:**
   - Weryfikacja odbywa się w Middleware poprzez `supabase.auth.getUser()`, co sprawdza ważność przesłanego ciasteczka (JWT).
   - Odświeżanie jest obsługiwane przez bibliotekę `@supabase/ssr` w połączeniu z logiką middleware, która zarządza ciasteczkami sesji.

4. **Opis kroków:**
   - Użytkownik próbuje wejść na chroniony zasób -> Middleware blokuje i przekierowuje.
   - Użytkownik loguje się -> Formularz wysyła dane do API -> API weryfikuje w Supabase -> Supabase zwraca sesję -> API ustawia ciasteczka -> Sukces.
   - Kolejne zapytania -> Middleware odczytuje ciasteczka -> Supabase weryfikuje -> Dostęp przyznany.
</authentication_analysis>

<mermaid_diagram>
```mermaid
sequenceDiagram
    autonumber
    
    participant Browser as Przeglądarka
    participant Middleware as Middleware (Astro)
    participant API as Astro API
    participant Supabase as Supabase Auth

    Note over Browser, Supabase: Scenariusz 1: Próba dostępu bez autoryzacji

    Browser->>Middleware: GET /dashboard
    activate Middleware
    Middleware->>Supabase: getUser(cookies)
    activate Supabase
    Supabase-->>Middleware: Session null / Error
    deactivate Supabase
    Middleware-->>Browser: Redirect /login
    deactivate Middleware

    Note over Browser, Supabase: Scenariusz 2: Proces Logowania

    Browser->>API: POST /api/auth/login (email, password)
    activate API
    API->>Supabase: signInWithPassword(email, password)
    activate Supabase
    
    alt Dane poprawne
        Supabase-->>API: Session object (Access + Refresh Token)
        API-->>Browser: 200 OK (Set-Cookie: access_token, refresh_token)
        Browser->>Browser: Przekierowanie do /dashboard
    else Błędne dane
        Supabase-->>API: Error (Invalid credentials)
        deactivate Supabase
        API-->>Browser: 401 Unauthorized (Error message)
        deactivate API
        Browser->>Browser: Wyświetl błąd logowania
    end

    Note over Browser, Supabase: Scenariusz 3: Proces Rejestracji (Nowy Użytkownik)

    Browser->>API: POST /api/auth/register (email, password)
    activate API
    API->>Supabase: signUp(email, password)
    activate Supabase
    
    alt Rejestracja udana
        Supabase-->>API: Session object (New User)
        Note right of Supabase: Email confirmation disabled (US-001)
        API-->>Browser: 200 OK (Set-Cookie: session)
        Browser->>Browser: Przekierowanie do /profile (Wypełnienie preferencji)
    else Użytkownik istnieje / Błąd
        Supabase-->>API: Error
        deactivate Supabase
        API-->>Browser: 400 Bad Request
        deactivate API
        Browser->>Browser: Wyświetl błąd rejestracji
    end

    Note over Browser, Supabase: Scenariusz 4: Dostęp do chronionej trasy (z sesją)

    Browser->>Middleware: GET /dashboard
    activate Middleware
    Middleware->>Supabase: getUser(cookies)
    activate Supabase
    
    alt Token ważny
        Supabase-->>Middleware: User object
        Middleware-->>Browser: Render Page (Dashboard)
    else Token wygasł (Auto-Refresh)
        Note right of Middleware: Supabase Client automatycznie<br/>obsługuje refresh token
        Supabase-->>Middleware: New Session / User object
        Middleware-->>Browser: Render Page + Set-Cookie (New Token)
    end
    deactivate Supabase
    deactivate Middleware

    Note over Browser, Supabase: Scenariusz 5: Wylogowanie

    Browser->>API: POST /api/auth/signout
    activate API
    API->>Supabase: signOut()
    activate Supabase
    Supabase-->>API: Success
    deactivate Supabase
    API-->>Browser: 200 OK (Clear Cookies)
    deactivate API
    Browser->>Browser: Przekierowanie do /login
```
</mermaid_diagram>
