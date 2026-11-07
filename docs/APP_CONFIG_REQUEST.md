# Configuração do Aplicativo (`app.json`) para APK Standalone

**Autor:** Antigravity (Worker B — UI & Motion)  
**Destinatário:** Codex (Coordenador)  
**Data:** 2026-11-07  

---

## 1. Ícones Gerados em `assets/`

Conforme solicitado para a geração do APK standalone com identidade visual autêntica do conceito **Caderno em Movimento**:
1. [`assets/campus-icon.png`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/assets/campus-icon.png): Ícone editorial em alta resolução (1024x1024 px), paleta papel quente `#F7F5EF`, tinta `#171A21`, lombada em azul elétrico `#314BCE` e fita de leitura / selo orbital em lima suave `#DBF57A`.
2. [`assets/android-icon-foreground.png`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/assets/android-icon-foreground.png): Imagem de primeiro plano adaptativo para Android (1024x1024 px).
3. [`assets/campus-icon.svg`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/assets/campus-icon.svg): Arquivo vetorial fonte SVG para referência e documentação.

---

## 2. Configuração Solicitada para `app.json`

Substituir o conteúdo de `app.json` por:

```json
{
  "expo": {
    "name": "Campus Conectado",
    "slug": "campus-conectado",
    "scheme": "campus-conectado",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "icon": "./assets/campus-icon.png",
    "splash": {
      "backgroundColor": "#F7F5EF",
      "resizeMode": "contain"
    },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      "expo-font",
      "@react-native-community/datetimepicker"
    ],
    "android": {
      "package": "br.edu.campusconectado.demo",
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundColor": "#F7F5EF"
      }
    }
  }
}
```
