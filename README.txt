ALFA SUPLEMENTOS — V9
=====================

Esta versão preserva V1–V8 e acrescenta uma camada de fidelidade, crescimento e gestão financeira.

PRINCIPAL CORREÇÃO SOLICITADA
- Revisão estrutural da index para eliminar sobreposição de elementos.
- Header adaptativo em notebooks e tablets.
- Navegação mobile posicionada abaixo do header.
- Hero reorganizado em telas menores.
- Tratamento dos elementos fixed das V6/V7/V8 (recentes, recuperação de carrinho, oferta ativa, WhatsApp e dock mobile).
- Proteções de min-width, overflow e responsividade para grids, modais e carrinho.
- CSS final de estabilidade em v9.css, carregado depois dos estilos anteriores.

NOVOS RECURSOS V9
- Clube Alfa: pontos por compras concluídas.
- Níveis Start, Pro e Elite configuráveis.
- Código de indicação gerado por cliente.
- Alertas locais de produto para reposição/preço.
- Nova aba Clube Alfa dentro da Central do Cliente.
- Painel Growth & Fidelidade.
- Meta mensal de receita.
- Lucro bruto e margem estimada usando custo por produto.
- Curva ABC de produtos baseada na receita registrada.
- Distribuição de clientes por nível.
- Configuração de pontos, metas, níveis e bônus de indicação.
- Campo de custo estimado no cadastro/edição de produtos.

IMPORTANTE
Os alertas de produto ficam salvos no navegador. Para enviar notificações reais (WhatsApp/e-mail/push), é necessária uma integração de mensageria/automação com consentimento do cliente.

SUPABASE
A V9 continua compatível com a arquitetura híbrida local + Supabase da V8. Execute schema.sql em um projeto de teste antes de publicar alterações no banco.

ARQUIVOS NOVOS
- v9.css
- v9.js
- admin-v9.css
- admin-v9.js
