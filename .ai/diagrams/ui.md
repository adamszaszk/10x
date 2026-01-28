<architecture_analysis>
1. **Zidentyfikowane Komponenty:**
   - **Strony (Pages):** `/login`, `/recover-password`, `/reset-password`, `/dashboard`, `/profile`.
   - **Komponenty React (UI):** `AuthContainer`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`.
   - **Layout/Shared:** `Layout.astro`, `LandingHeader.astro`.
   - **Backend/Middleware:** `src/middleware/index.ts`, `/api/auth/callback`, `/api/auth/signout`.
   - **Baza Danych/Auth:** Supabase Auth.

2. **Główne Strony i Komponenty:**
   - `/login`: Renderuje layout z nagłówkiem i `AuthContainer`.
   - `/recover-password`: Prosty formularz odzyskiwania hasła.
   - `/reset-password`: Formularz ustawiania nowego hasła (wymaga tokenu).

3. **Przepływ Danych:**
   - Middleware przechwytuje żądania, weryfikuje sesję z ciasteczek (Supabase) i dołącza obiekt użytkownika do `Astro.locals`.
   - Komponenty React (Forms) komunikują się bezpośrednio z Supabase API (client-side) do logowania/rejestracji.
   - Po sukcesie, następuje przekierowanie (Dashboard lub Profil).
   - Ścieżka odzyskiwania hasła używa endpointu API (`/api/auth/callback`) do wymiany kodu PKCE na sesję przed renderowaniem formularza zmiany hasła.

4. **Krótki Opis Funkcjonalności:**
   - **AuthContainer**: Zarządza stanem widoku (Logowanie vs Rejestracja).
   - **LoginForm**: Walidacja Zod, logowanie emailem/hasłem.
   - **RegisterForm**: Walidacja Zod, rejestracja, przekierowanie do wypełnienia profilu.
   - **Middleware**: Ochrona tras chronionych, hydracja sesji użytkownika.
   - **LandingHeader**: Warunkowe renderowanie przycisków (Zaloguj vs Profil) w zależności od stanu sesji.
</architecture_analysis>

<mermaid_diagram>
```mermaid
flowchart TD
    subgraph "Astro Serwer (SSR)"
        Middleware[("Middleware Auth<br>weryfikacja ciasteczek")]
        
        subgraph "Routing i Strony"
            LoginPg["/login<br>(Strona Logowania)"]
            RecoverPg["/recover-password<br>(Odzyskiwanie)"]
            ResetPg["/reset-password<br>(Zmiana Hasła)"]
            
            ProtectedRoutes{{"Chronione Trasy<br>/dashboard, /profile"}}
            
            APICallback["/api/auth/callback<br>(Obsługa PKCE)"]
            APISignout["/api/auth/signout<br>(Wylogowanie)"]
        end
        
        Layouts["Layout.astro<br>(Główny szablon)"]
        Header["LandingHeader.astro<br>(Nagłówek nawigacyjny)"]
    end

    subgraph "React Components (Klient)"
        AuthCont["AuthContainer.tsx<br>(Zarządzanie Stanem)"]
        
        subgraph "Formularze"
            LoginF["LoginForm.tsx"]
            RegisterF["RegisterForm.tsx"]
            ForgotF["ForgotPasswordForm.tsx"]
            ResetF["ResetPasswordForm.tsx"]
        end
        
        Zod["Walidacja Zod"]
    end

    subgraph "Zewnętrzne Serwisy"
        Supabase[("Supabase Auth<br>Baza Użytkowników")]
    end

    %% Połączenia Middleware i Routingu
    Middleware -->|Weryfikacja| ProtectedRoutes
    Middleware -->|Brak Sesji| LoginPg
    ProtectedRoutes -->|Sesja OK| Layouts
    
    %% Struktura Strony Logowania
    LoginPg --> Layouts
    Layouts --> Header
    Layouts --> AuthCont
    
    %% Logika Header
    Header -.->|Sprawdza Locals| Middleware
    Header -->|Akcja Logout| APISignout

    %% Komponenty AuthContainer
    AuthCont -->|"Tab: Zaloguj"| LoginF
    AuthCont -->|"Tab: Zarejestruj"| RegisterF
    AuthCont -.->|"Link: Zapomniałem hasła"| RecoverPg
    
    %% Odzyskiwanie Hasła
    RecoverPg --> ForgotF
    ForgotF --"Wysłanie Emaila"--> Supabase
    Supabase --"Link z kodem"--> APICallback
    APICallback --> ResetPg
    ResetPg --> ResetF
    
    %% Interakcje z Supabase
    LoginF --"signInWithPassword"--> Supabase
    RegisterF --"signUp"--> Supabase
    ResetF --"updateUser (password)"--> Supabase
    
    %% Walidacja
    LoginF --> Zod
    RegisterF --> Zod
    ResetF --> Zod
    
    %% Przekierowania po sukcesie
    Supabase --"Sukces (Login)"--> ProtectedRoutes
    Supabase --"Sukces (Rejestracja)"--> ProtectedRoutes
    
    %% Stylowanie
    classDef page fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef component fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef backend fill:#e0f2f1,stroke:#00695c,stroke-width:2px;
    classDef external fill:#f3e5f5,stroke:#880e4f,stroke-width:2px;
    
    class LoginPg,RecoverPg,ResetPg,ProtectedRoutes page;
    class AuthCont,LoginF,RegisterF,ForgotF,ResetF,Layouts,Header component;
    class Middleware,APICallback,APISignout backend;
    class Supabase external;
```
</mermaid_diagram>
