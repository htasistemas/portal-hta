# Portal TorreSoft

Site institucional estatico da TorreSoft Sistemas, preparado para deploy no Cloudflare Workers com Static Assets.

## Deploy em producao

O workflow `.github/workflows/static.yml` publica automaticamente no Cloudflare quando houver push na branch `main`.

Worker esperado: `portal-hta`
Dominio de producao: `https://torresoftbrasil.com.br`

### Secrets no GitHub

Cadastre estes secrets em `Settings > Secrets and variables > Actions` no repositorio GitHub:

- `CLOUDFLARE_ACCOUNT_ID`: Account ID da conta Cloudflare.
- `CLOUDFLARE_API_TOKEN`: token com permissao `Account > Workers Scripts > Edit`.

### Envio de e-mail do formulario

O formulario de contato envia para `/api/contact`, endpoint executado pelo Cloudflare Worker em `src/worker.js`.
O Worker usa a API do Resend, sem expor credenciais no navegador.

Configure estes secrets/variables no Worker `portal-hta`:

- `RESEND_API_KEY`: secret com a chave da API do Resend.
- `CONTACT_FROM_EMAIL`: remetente validado no Resend, por exemplo `TorreSoft Sistemas <contato@torresoftbrasil.com.br>`.
- `CONTACT_TO_EMAIL`: destinatario das solicitacoes. Padrao do codigo: `comercial@torresoftbrasil.com.br`.

Pelo Wrangler, os comandos sao:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_FROM_EMAIL
npx wrangler secret put CONTACT_TO_EMAIL
```

No Resend, valide o dominio usado no `CONTACT_FROM_EMAIL` antes de publicar em producao.

### Configuracao no Cloudflare

1. O Worker `portal-hta` deve existir em `Workers & Pages`.
2. Em `Workers & Pages > portal-hta > Domains`, mantenha o custom domain `torresoftbrasil.com.br`.
3. O arquivo `wrangler.toml` aponta os assets publicos para `./dist`.
4. Mantenha o registro/subdominio `g3n.torresoftbrasil.com.br` apontando para a hospedagem atual do sistema G3. O deploy do portal nao altera esse subdominio.

Depois disso, cada push em `main` atualiza o portal em `https://torresoftbrasil.com.br`.
