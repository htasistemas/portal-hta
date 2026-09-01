# Portal HTA / TorreSoft

Site institucional preparado para hospedagem no VPS da Hostinger usando os dominios:

- `torresoftbrasil.com.br`
- `www.torresoftbrasil.com.br`

O dominio principal para SEO e sitemap e `https://torresoftbrasil.com.br`.

## Deploy no VPS Hostinger

O workflow `.github/workflows/static.yml` publica automaticamente quando houver push na branch `main`.

Ele monta a pasta `dist/` com:

- paginas HTML;
- `assets/`;
- `img/`;
- `.htaccess`;
- `api/contact.php`;
- `api/contact.config.php` gerado a partir dos secrets do GitHub.

## Dados necessarios para subir no VPS

### 1. Acesso/DNS dos dominios

E preciso confirmar onde o DNS do dominio esta gerenciado e apontar ambos para o VPS:

- `torresoftbrasil.com.br`
- `www.torresoftbrasil.com.br`

O dominio `htasistemas.com.br` nao faz parte deste deploy e nao deve ser alterado.

### 2. Pasta publica do dominio

O Nginx do VPS aponta o portal para:

- `/var/www/portal-torresoft`

Configure apenas a pasta publica do `torresoftbrasil.com.br`.

### 3. Credenciais SSH

No GitHub, cadastre em `Settings > Secrets and variables > Actions`:

- `TORRESOFT_SSH_HOST`: IP ou host do VPS.
- `TORRESOFT_SSH_USERNAME`: usuario SSH.
- `TORRESOFT_SSH_PASSWORD`: senha SSH.

### 4. E-mail do formulario de contato

O formulario envia para `/api/contact`, executado em PHP na Hostinger, usando a API do Resend.

Cadastre tambem estes secrets no GitHub:

- `RESEND_API_KEY`: chave da API do Resend.
- `CONTACT_FROM_EMAIL`: remetente validado no Resend, por exemplo `TorreSoft Sistemas <comercial@torresoftbrasil.com.br>`.
- `CONTACT_TO_EMAIL`: destinatario das solicitacoes, por exemplo `comercial@torresoftbrasil.com.br`.

O dominio usado no `CONTACT_FROM_EMAIL` precisa estar validado no Resend antes da publicacao em producao.

## Observacoes

- O arquivo `api/contact.config.php` nao deve ser versionado no Git.
- O arquivo `.htaccess` faz `/api/contact` chamar `api/contact.php`.
- O subdominio do sistema G3, como `g3n.torresoftbrasil.com.br`, deve continuar apontando para a hospedagem atual dele. O deploy deste portal nao deve sobrescrever esse subdominio.
- O dominio `htasistemas.com.br` esta fora do escopo deste deploy.
