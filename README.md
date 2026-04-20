# **Tecnologías Utilizadas**
*   **Framework:** React + Vite
*   **Backend:** Supabase (PostgreSQL)
*   **Estilos:** Tailwind CSS + Shadcn/UI
*   **Gestión:** Jira + Lovable.dev

# 🚀 Configuración del Entorno: Instalación de Bun

Para este proyecto utilizaremos **Bun** como gestor de paquetes y motor de ejecución, debido a su alta velocidad comparada con NPM/Yarn. Es fundamental que todos los integrantes del equipo tengan Bun instalado para evitar conflictos de versiones.

---

## 🛠️ Pasos de Instalación por Sistema Operativo

### 🟦 Windows (PowerShell - Recomendado)
Abre una terminal de PowerShell como administrador y ejecuta:

```powershell
# 1. Instalar Bun
powershell -c "irm bun.sh/install.ps1 | iex"

# 2. Configurar PATH en la sesión actual
$env:Path += ";$HOME\.bun\bin"

# 3. Configurar PATH de forma permanente (para futuras terminales)
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$HOME\.bun\bin", "User")
```

### ⬛ Windows (CMD)
Si prefieres utilizar el Símbolo del Sistema tradicional:

```cmd
:: 1. Instalar (llama a powershell internamente)
powershell -c "irm bun.sh/install.ps1 | iex"

:: 2. Configurar PATH en la sesión actual
set PATH=%PATH%;%USERPROFILE%\.bun\bin

:: Nota: Se recomienda reiniciar el equipo o configurar manualmente 
:: las Variables de Entorno para que el cambio sea permanente.
```

### 🐧 Linux (Ubuntu, Debian, WSL)
Abre tu terminal de Bash y ejecuta:

```bash
# 1. Instalar
curl -fsSL https://bun.sh/install | bash

# 2. Configurar variables de entorno
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc

# 3. Recargar la configuración
source ~/.bashrc
```

### 🍎 Mac OS (Intel o Apple Silicon)
Abre la terminal (Zsh) y ejecuta:

```zsh
# 1. Instalar
curl -fsSL https://bun.sh/install | bash

# 2. Configurar variables de entorno
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc

# 3. Recargar la configuración
source ~/.zshrc
```

---

## ✅ Verificación de la Instalación

Una vez completados los pasos anteriores, **cierra todas tus terminales abiertas**, abre una nueva y ejecuta:

```bash
bun --version
```

Si visualizas un número de versión (ej: `1.1.x`), Bun está correctamente configurado.

---

## 🏃‍♂️ Comandos Rápidos del Proyecto

Una vez que tengas Bun instalado y hayas clonado el repositorio, usa estos comandos para trabajar en **Habitatrack**:

1. **Instalar dependencias:**
   ```bash
   bun install
   ```
2. **Levantar el entorno de desarrollo local:**
   ```bash
   bun dev
   ```
3. **Generar el build de producción:**
   ```bash
   bun run build
   ```



Esto le dará un toque muy profesional ante los ojos del profesor. ¡Mucho éxito con el inicio de Habitatrack!
