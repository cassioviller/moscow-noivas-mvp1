# SECURITY_CHECKLIST_SKILLS.md — Segurança ao instalar e usar skills no Codex

## 1. Antes de instalar skills externas

- [ ] Verifique a origem da skill.
- [ ] Leia o `SKILL.md`.
- [ ] Veja se há pasta `scripts/`.
- [ ] Veja se há comandos shell.
- [ ] Veja se a skill pede acesso a navegador, arquivos ou rede.
- [ ] Não informe senhas, tokens, chaves de API ou dados sensíveis.
- [ ] Teste primeiro em um projeto separado se não confiar totalmente.

## 2. Ao usar `npx skills add`

- [ ] Confirme o nome do pacote/repositório.
- [ ] Prefira fontes oficiais.
- [ ] Não rode comandos copiados de comentários aleatórios.
- [ ] Revise arquivos gerados depois da instalação.

## 3. Ao usar MagicPath ou ferramentas visuais externas

- [ ] Não suba dados reais de clientes.
- [ ] Não suba senhas ou tokens.
- [ ] Use dados fictícios.
- [ ] Revise o código antes de aplicar ao repositório.

## 4. Ao usar Computer Use ou navegador

- [ ] Não deixe aberto e-mail, banco, WhatsApp ou dados sensíveis.
- [ ] Não permita ações automáticas sem revisar.
- [ ] Use apenas no projeto atual.
- [ ] Revise permissões.

## 5. Ao aceitar alterações do Codex

- [ ] Revise o diff.
- [ ] Verifique se não mexeu em backend sem necessidade.
- [ ] Rode build.
- [ ] Rode testes.
- [ ] Abra o app localmente.
- [ ] Teste navegação principal.

## 6. Regra de ouro

Skill ajuda, mas não substitui revisão.

Nunca aceite alteração grande sem olhar o diff.
