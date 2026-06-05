# Portal HTA

Site institucional estatico da HTA Sistemas, preparado para deploy no Cloudflare Workers com Static Assets.

## Deploy em producao

O workflow `.github/workflows/static.yml` publica automaticamente no Cloudflare quando houver push na branch `main`.

Worker esperado: `portal-hta`
Dominio de producao: `https://htasistemas.com.br`

### Secrets no GitHub

Cadastre estes secrets em `Settings > Secrets and variables > Actions` no repositorio GitHub:

- `CLOUDFLARE_ACCOUNT_ID`: Account ID da conta Cloudflare.
- `CLOUDFLARE_API_TOKEN`: token com permissao `Account > Workers Scripts > Edit`.

### Configuracao no Cloudflare

1. O Worker `portal-hta` deve existir em `Workers & Pages`.
2. Em `Workers & Pages > portal-hta > Domains`, mantenha o custom domain `htasistemas.com.br`.
3. O arquivo `wrangler.toml` aponta os assets publicos para `./dist`.
4. Mantenha o registro/subdominio `g3n.htasistemas.com.br` apontando para a hospedagem atual do sistema G3. O deploy do portal nao altera esse subdominio.

Depois disso, cada push em `main` atualiza o portal em `https://htasistemas.com.br`.